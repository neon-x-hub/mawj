import fs from 'fs/promises';
import path from 'path';
import DBProvider from './provider.js';

class JSONProvider extends DBProvider {
    constructor(basePath = './data') {
        super();
        this.basePath = basePath;
    }

    async create(collectionName, data) {
        const id = this._generateId();
        const document = { ...data, id };
        await this._writeFile(collectionName, id, document);
        return document;
    }

    async find(collectionName, filter = {}) {
        const documents = await this._getAll(collectionName);
        return documents.filter(doc => this._matchesFilter(doc, filter));
    }

    async findById(collectionName, id) {
        return this._readFile(collectionName, id);
    }

    async update(collectionName, id, updates) {
        const current = await this.findById(collectionName, id);
        if (!current) return null;

        const updated = { ...current, ...updates };
        await this._writeFile(collectionName, id, updated);
        return updated;
    }

    async delete(collectionName, id) {
        try {
            await fs.unlink(this._getPath(collectionName, id));
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') return false;
            throw err;
        }
    }

    // --- Internal Helpers ---
    async _writeFile(collectionName, id, data) {
        const dir = path.join(this.basePath, collectionName);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(
            path.join(dir, `${id}.json`),
            JSON.stringify(data, null, 2)
        );
    }

    async _readFile(collectionName, id) {
        try {
            const data = await fs.readFile(
                this._getPath(collectionName, id),
                'utf8'
            );
            return JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') return null;
            throw err;
        }
    }

    async _getAll(collectionName) {
        const dir = path.join(this.basePath, collectionName);
        try {
            const files = await fs.readdir(dir);
            return Promise.all(
                files
                    .filter(file => file.endsWith('.json'))
                    .map(file => this._readFile(collectionName, path.basename(file, '.json')))
            );
        } catch (err) {
            if (err.code === 'ENOENT') return [];
            throw err;
        }
    }

    _matchesFilter(doc, filter) {
        return Object.entries(filter).every(([key, value]) => {
            if (typeof value === 'function') return value(doc[key]);
            return doc[key] === value;
        });
    }

    _getPath(collectionName, id) {
        return path.join(this.basePath, collectionName, `${id}.json`);
    }

    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}

export default JSONProvider;
