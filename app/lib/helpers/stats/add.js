import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import getProjectStatsFile from './file';

const MAX_TIME_SPAN_DAYS = 30;

function isWithinDays(dateStr, days) {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diff = now - eventDate;
    return diff <= days * 24 * 60 * 60 * 1000;
}

export default async function addProjectStatsEvent({ projectId, action, data }) {
    const statsPath = getProjectStatsFile(projectId);

    const now = new Date().toISOString();
    const newEvent = {
        timestamp: now,
        data,
    };

    let stats = {
        generation: [],
        data_ingestion: [],
    };

    try {
        const raw = await readFile(statsPath, 'utf-8');
        stats = JSON.parse(raw);
    } catch {
        // If file doesn't exist, stick with empty structure
    }

    // Make sure action array exists
    if (!Array.isArray(stats[action])) {
        stats[action] = [];
    }

    // Filter old events within the action type only
    stats[action] = stats[action].filter(e => isWithinDays(e.timestamp, MAX_TIME_SPAN_DAYS));

    // Append new event
    stats[action].push(newEvent);

    // Ensure directory exists
    await mkdir(path.dirname(statsPath), { recursive: true });

    // Save
    await writeFile(statsPath, JSON.stringify(stats), 'utf-8');
}
