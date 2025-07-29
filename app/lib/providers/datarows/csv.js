import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { DataProvider } from './provider.js';

const DATA_DIR = process.env.DATA_DIR || './data/projects';

export class CsvDataProvider extends DataProvider {
    #dataPath;
    #metadataPath;

    constructor(projectId) {
        super(projectId);
        this.#dataPath = path.join(DATA_DIR, projectId, 'data');
        this.#metadataPath = path.join(this.#dataPath, 'metadata.json');
    }

    async #ensureDataDir() {
        await fs.mkdir(this.#dataPath, { recursive: true });
        try {
            await fs.access(this.#metadataPath);
        } catch {
            await fs.writeFile(this.#metadataPath, JSON.stringify({
                totalRows: 0,
                doneRows: 0,
                attributes: [],
                files: []
            }, null, 2));
        }
    }

    async #getLatestFile() {
        const metadata = await this.getMetadata();
        if (metadata.files.length === 0) return null;
        return path.join(this.#dataPath, metadata.files[metadata.files.length - 1]);
    }

    async appendRows(csvData) {
        await this.#ensureDataDir();
        const metadata = await this.getMetadata();

        // Parse and transform CSV
        const rawRows = parse(csvData, { columns: true });
        const transformedRows = rawRows.map((row, i) => ({
            'm.id': `${this.projectId}-${metadata.totalRows + i + 1}`,
            'm.status': 'pending',
            'm.timestamp': new Date().toISOString(),
            ...row
        }));

        // Update metadata attributes
        const newAttributes = [...new Set([
            ...metadata.attributes,
            ...Object.keys(rawRows[0] || [])
        ])];

        // Check if we should append to last file
        let filesToAdd = [];
        let currentChunk = [];
        let currentSize = 0;

        for (const row of transformedRows) {
            const rowSize = Buffer.byteLength(JSON.stringify(row));

            if (currentSize + rowSize > MAX_FILE_SIZE && currentChunk.length > 0) {
                filesToAdd.push(currentChunk);
                currentChunk = [];
                currentSize = 0;
            }

            currentChunk.push(row);
            currentSize += rowSize;
        }

        if (currentChunk.length > 0) {
            filesToAdd.push(currentChunk);
        }

        // Write files
        let fileCount = metadata.files.length;
        const newFiles = [];

        for (const chunk of filesToAdd) {
            fileCount++;
            const fileName = `${fileCount}.csv`;
            const filePath = path.join(this.#dataPath, fileName);

            await fs.writeFile(
                filePath,
                stringify(chunk, { header: newFiles.length === 0 }) // Only write header for first file
            );

            newFiles.push(fileName);
        }

        // Update metadata
        await fs.writeFile(this.#metadataPath, JSON.stringify({
            totalRows: metadata.totalRows + transformedRows.length,
            doneRows: metadata.doneRows,
            attributes: newAttributes,
            files: [...metadata.files, ...newFiles]
        }, null, 2));

        return {
            addedRows: transformedRows.length,
            addedFiles: newFiles.length,
            sampleRow: transformedRows[0]
        };
    }

    async findRows(filter = {}) {
        const metadata = await this.getMetadata();
        const results = [];

        for (const file of metadata.files) {
            const content = await fs.readFile(path.join(this.#dataPath, file), 'utf8');
            const rows = parse(content, { columns: true });

            rows.forEach(row => {
                if (this.#matchesFilter(row, filter)) {
                    results.push(row);
                }
            });
        }

        return results;
    }

    #matchesFilter(row, filter) {
        return Object.entries(filter).every(([key, value]) => {
            const rowValue = row[key.startsWith('m.') ? key : `d.${key}`];
            if (typeof value === 'function') return value(rowValue);
            return row[rowValue] === value;
        });
    }

    async getMetadata() {
        try {
            const data = await fs.readFile(this.#metadataPath, 'utf8');
            return JSON.parse(data);
        } catch {
            return {
                totalRows: 0,
                doneRows: 0,
                attributes: [],
                files: []
            };
        }
    }

    async deleteRow(id) {
        await this.#ensureDataDir();
        const metadata = await this.getMetadata();
        let deleted = false;
        let fileUpdated = null;

        // Search through all files (not just first match)
        for (const file of metadata.files) {
            const filePath = path.join(this.#dataPath, file);
            const content = await fs.readFile(filePath, 'utf8');
            const rows = parse(content, { columns: true });

            const originalCount = rows.length;
            const updatedRows = rows.filter(row => row['m.id'] !== id);

            if (updatedRows.length < originalCount) {
                deleted = true;
                fileUpdated = file;

                if (updatedRows.length > 0) {
                    await fs.writeFile(
                        filePath,
                        stringify(updatedRows, {
                            header: true,
                            columns: Object.keys(updatedRows[0]) // Maintain column order
                        })
                    );
                } else {
                    // Remove empty file completely
                    await fs.unlink(filePath);
                    metadata.files = metadata.files.filter(f => f !== file);
                }
                break;
            }
        }

        if (!deleted) {
            throw new Error(`Row with ID ${id} not found`);
        }

        // Update metadata
        await fs.writeFile(this.#metadataPath, JSON.stringify({
            ...metadata,
            totalRows: metadata.totalRows - 1,
            // Note: If tracking doneRows, you might need additional logic here
        }, null, 2));

        return {
            success: true,
            deletedId: id,
            file: fileUpdated
        };
    }
}
