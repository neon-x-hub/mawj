// lib/queue/InMemoryQueue.js
import AbstractQueue from './provider.js';
import generateId from '../id/generate.js';

/**
 * A simple in-memory job queue for Next.js
 * Runs jobs asynchronously inside the same process (no worker_threads).
 */
export default class InMemoryQueue extends AbstractQueue {
    constructor(concurrency = 1) {
        super();
        this.concurrency = concurrency;
        this.jobs = new Map();   // jobId → metadata
        this.queue = [];         // pending jobs
        this.activeCount = 0;
    }

    /**
     * Add a new job to the queue
     * @param {Object} jobData - payload for the job
     * @param {Function} jobFn - async function(jobData, progressCallback)
     * @returns {string} jobId
     */
    addJob(jobData, jobFn) {
        const jobId = generateId(4);
        this.jobs.set(jobId, {
            id: jobId,
            status: 'pending',
            progress: 0,
            result: null,
            error: null,
            createdAt: Date.now()
        });

        this.queue.push({ id: jobId, data: jobData, fn: jobFn });
        this.processNext();

        return jobId;
    }

    /**
     * Process next job if concurrency allows
     */
    async processNext() {
        if (this.activeCount >= this.concurrency) return;
        const next = this.queue.shift();
        if (!next) return;

        const job = this.jobs.get(next.id);
        if (!job) return;

        job.status = 'processing';
        this.activeCount++;

        try {
            const result = await next.fn(next.data, (progress) => {
                this.updateProgress(next.id, progress);
            });
            job.status = 'done';
            job.result = result;
        } catch (err) {
            job.status = 'error';
            job.error = err.message;
        } finally {
            this.activeCount--;
            this.processNext();
        }
    }

    /**
     * Update progress of a running job
     */
    updateProgress(jobId, progress) {
        const job = this.jobs.get(jobId);
        if (job) job.progress = progress;
    }

    /**
     * Get job metadata
     */
    getJob(jobId) {
        return this.jobs.get(jobId) || null;
    }

    /**
     * Cancel a job (optional)
     */
    cancelJob(jobId) {
        const job = this.jobs.get(jobId);
        if (job && job.status === 'pending') {
            this.queue = this.queue.filter((q) => q.id !== jobId);
            job.status = 'cancelled';
        }
    }
}
