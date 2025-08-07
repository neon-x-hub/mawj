import path from 'path';

export default function getProjectStatsFile(projectId) {
    return path.join(
        process.env.BASE_DIR || './data',
        'projects',
        projectId,
        'stats',
        'events.json'
    );
}
