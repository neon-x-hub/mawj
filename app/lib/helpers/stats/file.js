import path from 'path';
import config from '@/app/lib/providers/config';

const DATA_DIR = await config.get('baseFolder') || './data';

export default  function getProjectStatsFile(projectId) {
    return path.join(
        DATA_DIR,
        'projects',
        projectId,
        'stats',
        'events.json'
    );
}
