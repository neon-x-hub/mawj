import JSONProvider from '../db/json3.js';
import { normalizeDataRow } from '../../helpers/data/normalise.js';
import config from '@/app/lib/providers/config';

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
            const instance = new JSONProvider(
                (await config.get('baseFolder') || './data') + '/datarows',
                50 * 1024,
                6,
                normalizeDataRow
            );
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
