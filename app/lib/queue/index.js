import InMemoryQueue from './InMemory.js';
import { workerRenderer } from '@/app/lib/engine/image/worker.js';
import { workerVideoRenderer } from '../engine/video/worker.js';
const globalForQueue = globalThis;

if (!globalForQueue.__QUEUE__) {
    globalForQueue.__QUEUE__ = new InMemoryQueue(2);
}

export const queue = globalForQueue.__QUEUE__;

export function enqueueRenderJob(jobData) {
    if (jobData.project.type === 'video') {
        return queue.addJob(jobData, workerVideoRenderer);
    }
    return queue.addJob(jobData, workerRenderer);
}
