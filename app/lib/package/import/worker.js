import { importProjectBundle } from './importProject.js';

/**
 * Runs the import job for a project bundle.
 *
 * @param {Object} jobData - { zipFilePath, options }
 * @param {Function} onProgress - callback function to report progress (0-100)
 * @returns {Promise<Object>} Result object from importProjectBundle
 */
export async function workerImporter(jobData, onProgress) {
    const { zipFilePath, options = {} } = jobData;

    // Clone and inject onProgress into options
    const importOptions = {
        ...options,
        onProgress: (percent) => {
            if (onProgress && typeof onProgress === 'function') {
                onProgress(percent);
            }
        }
    };

    const result = await importProjectBundle(zipFilePath, importOptions);

    onProgress?.(100);

    return result;
}
