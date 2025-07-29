import { CsvDataProvider } from './csv.js';

let dataProviderInstance = null;
let initializationPromise = null;

/**
 * Get the singleton DataProvider instance for a specific project
 * @param {string} projectId
 * @returns {Promise<CsvDataProvider>}
 */
async function getDataProvider(projectId) {
    if (!projectId) throw new Error('Project ID is required');

    // Cache key based on projectId
    const cacheKey = `project-${projectId}`;

    if (dataProviderInstance?.[cacheKey]) {
        return dataProviderInstance[cacheKey];
    }

    if (!initializationPromise) {
        initializationPromise = (async () => {
            const instance = {
                [cacheKey]: new CsvDataProvider(projectId)
            };
            // Perform any initialization here if needed
            return instance;
        })();
    }

    dataProviderInstance = await initializationPromise;
    return dataProviderInstance[cacheKey];
}

/**
 * For testing purposes - reset the singleton
 */
function _reset() {
    dataProviderInstance = null;
    initializationPromise = null;
}

const data = {
    getDataProvider,
    _reset // Export for testing only
};

export default data;
