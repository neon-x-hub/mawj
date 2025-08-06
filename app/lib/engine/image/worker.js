import { render } from './renderer.js';
import datarows from '../../providers/datarows/index.js';

export async function workerRenderer(jobData, onProgress) {
    const { project, template, rows, options } = jobData;
    const total = rows.length;
    let completed = 0;

    const dataRowsInstance = await datarows.getDataProvider();

    // --- Batch buffer and flush mechanism ---
    const BATCH_SIZE = 20; // configurable batch size
    const FLUSH_INTERVAL = 500; // flush every 500ms (configurable)
    let buffer = [];
    let flushTimeout;

    const flushBuffer = async () => {
        if (buffer.length === 0) return;
        const updates = buffer.splice(0, buffer.length); // take all pending updates
        await dataRowsInstance.bulkUpdate(project.id, updates);
    };

    const scheduleFlush = () => {
        if (!flushTimeout) {
            flushTimeout = setTimeout(async () => {
                flushTimeout = null;
                await flushBuffer();
            }, FLUSH_INTERVAL);
        }
    };

    const onRowRenderCompleted = async (rowId) => {
        completed++;
        const progress = Math.round((completed / total) * 100);
        if (onProgress) onProgress(progress);

        // add update to batch buffer
        buffer.push({ id: rowId, data: { status: true } });

        // flush immediately if buffer is large enough, else schedule a flush
        if (buffer.length >= BATCH_SIZE) {
            await flushBuffer();
        } else {
            scheduleFlush();
        }
    };

    const result = await render(project, template, rows, options, onRowRenderCompleted);

    // final flush to ensure all updates are sent
    await flushBuffer();

    return result;
}
