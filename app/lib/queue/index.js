import InMemoryQueue from './InMemory.js';
import { workerRenderer } from '@/app/lib/engine/image/worker.js';

const globalForQueue = globalThis;

if (!globalForQueue.__QUEUE__) {
  globalForQueue.__QUEUE__ = new InMemoryQueue(2);
}

export const queue = globalForQueue.__QUEUE__;

export function enqueueRenderJob(jobData) {
  return queue.addJob(jobData, workerRenderer);
}
