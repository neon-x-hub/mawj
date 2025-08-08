import { createProjectBundle } from './exportProject.js';

/**
 * Runs the export job for a project.
 *
 * @param {Object} jobData - { project, template, options }
 * @param {Function} onProgress - callback function to report progress (0-100)
 * @returns {Promise<string>} Path to the generated ZIP file
 */
export async function workerExporter(jobData, onProgress) {
    const { project, template, options = {} } = jobData;

    // Clone and inject onProgress into options
    const exportOptions = {
        ...options,
        onProgress: (percent) => {
            if (onProgress && typeof onProgress === 'function') {
                onProgress(percent);
            }
        }
    };

    const zipPath = await createProjectBundle(project, template, exportOptions);

    onProgress?.(100);

    return zipPath;
}
