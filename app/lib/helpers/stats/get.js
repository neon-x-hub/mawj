import { readFile } from 'fs/promises';
import getProjectStatsFile from './file';

export default async function getProjectStats(projectId) {
    const statsPath = getProjectStatsFile(projectId);

    try {
        const raw = await readFile(statsPath, 'utf-8');
        const events = JSON.parse(raw);
        return events;
    } catch (err) {
        return [];
    }
}
