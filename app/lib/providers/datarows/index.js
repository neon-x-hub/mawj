import JSONProvider from '../db/json3.js';

let dataProviderInstance = null;
let initializationPromise = null;

/**
 * Get the singleton JSONProvider instance for datarows
 * @returns {Promise<JSONProvider>}
 */
async function getDataProvider() {
    if (dataProviderInstance) return dataProviderInstance;

    if (!initializationPromise) {
        initializationPromise = (async () => {
            const instance = new JSONProvider(process.env.DATA_DIR ? `${process.env.DATA_DIR}/datarows` : './data/datarows');
            // Perform any additional initialization here if needed
            return instance;
        })();
    }

    dataProviderInstance = await initializationPromise;
    return dataProviderInstance;
}

/**
 * For testing purposes - reset the singleton
 */
function _reset() {
    dataProviderInstance = null;
    initializationPromise = null;
}

const datarows = {
    getDataProvider,
    _reset // Export for testing only
};

export default datarows;
