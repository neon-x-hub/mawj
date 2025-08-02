import fs from 'fs/promises';
import path from 'path';
import DBProvider from './provider.js';

class JSONProvider extends DBProvider {
    constructor(basePath = './data', segmentSize = 50 * 1024) {
        super();
        this.basePath = basePath;
        this.segmentSize = segmentSize;
        this.locks = new Map();
    }

    /* ------------------- PUBLIC API ------------------- */

    async create(collectionName, data) {
        const release = await this._lock(collectionName);
        try {
            const { segment, segmentFile } = await this._getWritableSegment(collectionName);
            const records = await this._readSegment(collectionName, segmentFile);

            const id = this._generateId(segment);
            const doc = { ...data, id };
            records[id] = doc;

            await this._writeSegment(collectionName, segmentFile, records);
            return doc;
        } finally {
            release();
        }
    }

    async bulkCreate(collectionName, docsArray) {
        if (!Array.isArray(docsArray) || docsArray.length === 0) return [];

        const release = await this._lock(collectionName);
        try {
            const created = [];
            let { segment, segmentFile } = await this._getWritableSegment(collectionName);
            let records = await this._readSegment(collectionName, segmentFile);
            let currentSize = Buffer.byteLength(JSON.stringify(records));

            for (const data of docsArray) {
                const id = this._generateId(segment);
                const doc = { ...data, id };
                records[id] = doc;
                created.push(doc);

                // Check if file would exceed limit
                currentSize += Buffer.byteLength(JSON.stringify(doc));
                if (currentSize >= this.segmentSize) {
                    await this._writeSegment(collectionName, segmentFile, records);
                    // start new segment
                    segment++;
                    segmentFile = `segment_${segment}.json`;
                    records = {};
                    currentSize = 0;
                }
            }
            await this._writeSegment(collectionName, segmentFile, records);
            return created;
        } finally {
            release();
        }
    }

    async find(collectionName, filter = {}, { limit = Infinity, offset = 0 } = {}) {
        const segments = await this._listSegments(collectionName);
        const results = [];
        let skipped = 0;

        for (const seg of segments) {
            const records = await this._readSegment(collectionName, seg);
            for (const doc of Object.values(records)) {
                if (!this._matchesFilter(doc, filter)) continue;
                if (skipped < offset) { skipped++; continue; }
                results.push(doc);
                if (results.length >= limit) return results;
            }
        }
        return results;
    }

    async findById(collectionName, id) {
        const segmentFile = this._segmentFileFromId(id);
        const records = await this._readSegment(collectionName, segmentFile);
        return records[id] || null;
    }

    async bulkFindByIds(collectionName, ids) {
        const grouped = this._groupIdsBySegment(ids);
        const results = [];

        for (const [segment, idList] of Object.entries(grouped)) {
            const file = `segment_${segment}.json`;
            const records = await this._readSegment(collectionName, file);
            for (const id of idList) {
                if (records[id]) results.push(records[id]);
            }
        }
        return results;
    }

    async update(collectionName, id, updates) {
        const release = await this._lock(collectionName);
        try {
            const segmentFile = this._segmentFileFromId(id);
            const records = await this._readSegment(collectionName, segmentFile);
            if (!records[id]) return null;

            records[id] = { ...records[id], ...updates };
            await this._writeSegment(collectionName, segmentFile, records);
            return records[id];
        } finally {
            release();
        }
    }

    async bulkUpdate(collectionName, updatesArray) {
        const release = await this._lock(collectionName);
        try {
            const grouped = {};
            for (const { id, data } of updatesArray) {
                const seg = this._segmentFromId(id);
                grouped[seg] = grouped[seg] || [];
                grouped[seg].push({ id, data });
            }

            const updated = [];
            for (const [seg, items] of Object.entries(grouped)) {
                const file = `segment_${seg}.json`;
                const records = await this._readSegment(collectionName, file);
                for (const { id, data } of items) {
                    if (records[id]) {
                        records[id] = { ...records[id], ...data };
                        updated.push(records[id]);
                    }
                }
                await this._writeSegment(collectionName, file, records);
            }
            return updated;
        } finally {
            release();
        }
    }

    async delete(collectionName, id) {
        const release = await this._lock(collectionName);
        try {
            const segmentFile = this._segmentFileFromId(id);
            const records = await this._readSegment(collectionName, segmentFile);
            if (!records[id]) return false;

            delete records[id];
            await this._writeSegment(collectionName, segmentFile, records);
            return true;
        } finally {
            release();
        }
    }

    async bulkDelete(collectionName, ids) {
        const release = await this._lock(collectionName);
        try {
            const grouped = this._groupIdsBySegment(ids);
            let deletedCount = 0;

            for (const [seg, idList] of Object.entries(grouped)) {
                const file = `segment_${seg}.json`;
                const records = await this._readSegment(collectionName, file);
                let changed = false;
                for (const id of idList) {
                    if (records[id]) {
                        delete records[id];
                        deletedCount++;
                        changed = true;
                    }
                }
                if (changed) await this._writeSegment(collectionName, file, records);
            }
            return deletedCount;
        } finally {
            release();
        }
    }

    /* ------------------- INTERNAL HELPERS ------------------- */

    async _getCollectionPath(name) {
        const dir = path.join(this.basePath, name);
        await fs.mkdir(dir, { recursive: true });
        return dir;
    }

    async _listSegments(name) {
        const dir = await this._getCollectionPath(name);
        const files = await fs.readdir(dir);
        return files.filter(f => f.startsWith('segment_') && f.endsWith('.json')).sort();
    }

    async _getWritableSegment(name) {
        const segments = await this._listSegments(name);
        if (segments.length === 0) return { segment: 0, segmentFile: 'segment_0.json' };

        const last = segments[segments.length - 1];
        const segNum = parseInt(last.match(/segment_(\d+)\.json/)[1]);
        const filePath = path.join(await this._getCollectionPath(name), last);
        const stats = await fs.stat(filePath);

        if (stats.size >= this.segmentSize) {
            return { segment: segNum + 1, segmentFile: `segment_${segNum + 1}.json` };
        }
        return { segment: segNum, segmentFile: last };
    }

    async _readSegment(name, segment) {
        try {
            const file = path.join(await this._getCollectionPath(name), segment);
            const data = await fs.readFile(file, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') return {};
            throw err;
        }
    }

    async _writeSegment(name, segment, records) {
        const file = path.join(await this._getCollectionPath(name), segment);
        await fs.writeFile(file, JSON.stringify(records, null, 2));
    }

    _generateId(segment) {
        return `${segment}_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    }

    _segmentFromId(id) {
        return parseInt(id.split('_')[0], 10);
    }

    _segmentFileFromId(id) {
        return `segment_${this._segmentFromId(id)}.json`;
    }

    _groupIdsBySegment(ids) {
        const grouped = {};
        for (const id of ids) {
            const seg = this._segmentFromId(id);
            if (!grouped[seg]) grouped[seg] = [];
            grouped[seg].push(id);
        }
        return grouped;
    }

    _matchesFilter(doc, filter) {
        return Object.entries(filter).every(([key, value]) => {
            const field = doc[key];
            if (typeof value === 'function') return value(field);
            if (typeof field === 'string' && typeof value === 'string')
                return field.toLowerCase().includes(value.toLowerCase());
            if (typeof value === 'object' && value !== null) {
                const { min, max } = value;
                if (typeof field === 'number' || field instanceof Date) {
                    const fVal = field instanceof Date ? field.getTime() : field;
                    const minVal = min instanceof Date ? min.getTime() : min;
                    const maxVal = max instanceof Date ? max.getTime() : max;
                    if (min !== undefined && fVal < minVal) return false;
                    if (max !== undefined && fVal > maxVal) return false;
                    return true;
                }
            }
            return field === value;
        });
    }

    /* ------------------- SIMPLE MUTEX ------------------- */
    async _lock(name) {
        const existing = this.locks.get(name) || Promise.resolve();
        let release;
        const lock = new Promise(res => (release = res));
        this.locks.set(name, existing.then(() => lock));
        return release;
    }
}

export default JSONProvider;
