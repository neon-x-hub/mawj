import JSONProvider from './json3.js';
import config from '@/app/lib/providers/config';

let dbInstance = null;
let initializationPromise = null;

/**
 * Get the singleton DB instance
 * @returns {Promise<JSONProvider>}
 */
async function getDB() {
    if (dbInstance) return dbInstance;

    if (!initializationPromise) {
        initializationPromise = (async () => {
            const instance = new JSONProvider(
                await config.get('baseFolder') || './data',
                50 * 1024,
                10
            );
            // Perform any initialization here if needed
            return instance;
        })();
    }

    dbInstance = await initializationPromise;
    return dbInstance;
}

/**
 * For testing purposes - reset the singleton
 */
function _reset() {
    dbInstance = null;
    initializationPromise = null;
}

const db = {
    getDB,
    _reset // Export for testing only
};

export default db;
