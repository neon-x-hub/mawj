// lib/engine/image/workerRenderer.js
import { render } from './renderer.js';

export async function workerRenderer(jobData, onProgress) {
    const { project, template, rows, options } = jobData;
    const total = rows.length;
    let completed = 0;

    const onRowRenderCompleted = (rowId) => {
        completed++;
        const progress = Math.round((completed / total) * 100);
        if (onProgress) onProgress(progress);
    };

    return await render(project, template, rows, options, onRowRenderCompleted);
}
