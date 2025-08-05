export default class AbstractQueue {
    constructor() {
        if (new.target === AbstractQueue) {
            throw new Error("Cannot instantiate AbstractQueue directly.");
        }
    }

    /**
     * Add a new job to the queue.
     * @param {Object} jobData - The data associated with the job.
     * @returns {string} jobId
     */
    addJob(jobData) {
        throw new Error("addJob() must be implemented by subclass.");
    }

    /**
     * Start processing jobs in the queue.
     */
    processNext() {
        throw new Error("processNext() must be implemented by subclass.");
    }

    /**
     * Update progress of a job.
     * @param {string} jobId
     * @param {number} progress - Progress percentage (0-100).
     */
    updateProgress(jobId, progress) {
        throw new Error("updateProgress() must be implemented by subclass.");
    }

    /**
     * Set result of a job when it's finished.
     * @param {string} jobId
     * @param {any} result
     */
    setResult(jobId, result) {
        throw new Error("setResult() must be implemented by subclass.");
    }

    /**
     * Get current state of a job (for polling).
     * @param {string} jobId
     * @returns {Object|null}
     */
    getJob(jobId) {
        throw new Error("getJob() must be implemented by subclass.");
    }

    /**
     * Internal: how to actually run a job.
     * Must be implemented by a subclass to define execution logic.
     */
    async runJob(jobId, jobData) {
        throw new Error("runJob() must be implemented by subclass.");
    }
}
