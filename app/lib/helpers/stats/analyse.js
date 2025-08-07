import { readFile } from 'fs/promises';
import getProjectStatsFile from './file';

function formatDate(dateStr) {
    return new Date(dateStr).toISOString().slice(0, 10); // YYYY-MM-DD
}
/**
 *
 * @param {string} projectId
 * @returns {Promise<Object>}
 * Example result:
  {
  "generation": {
    "daily": {
      "2025-08-06": { "count": 10, "timeTaken": 5 },
      "2025-08-07": { "count": 15, "timeTaken": 9 }
    },
    "insights": {
      "totalCount": 25,
      "totalTimeTaken": 14,
      "averagePerDay": 12.5,
      "averageTimePerEvent": 0.56,
      "mostActiveDay": "2025-08-07",
      "daysTracked": 2
    }
  },
  "data_ingestion": {
    "daily": {
      "2025-08-06": { "count": 100, "timeTaken": 0 }
    },
    "insights": {
      "totalCount": 100,
      "totalTimeTaken": 0,
      "averagePerDay": 100,
      "averageTimePerEvent": 0,
      "mostActiveDay": "2025-08-06",
      "daysTracked": 1
    }
  }
}
 */
export default async function analyzeProjectStats(projectId) {
    const statsPath = getProjectStatsFile(projectId);

    let stats = {
        generation: [],
        data_ingestion: [],
    };

    try {
        const raw = await readFile(statsPath, 'utf-8');
        stats = JSON.parse(raw);
    } catch {
        return { error: 'No stats found' };
    }

    const result = {};

    for (const action of Object.keys(stats)) {
        const daily = {};
        let totalCount = 0;
        let totalTime = 0;

        for (const event of stats[action]) {
            const day = formatDate(event.timestamp);
            const count = event.data.count || 0;
            const timeTaken = event.data.timeTaken || 0;

            if (!daily[day]) {
                daily[day] = { count: 0, timeTaken: 0 };
            }

            daily[day].count += count;
            daily[day].timeTaken += timeTaken;

            totalCount += count;
            totalTime += timeTaken;
        }

        const days = Object.keys(daily);
        const mostActiveDay = days.sort((a, b) => daily[b].count - daily[a].count)[0] || null;
        const averagePerDay = days.length ? totalCount / days.length : 0;
        const averageTimePerEvent = totalCount ? totalTime / totalCount : 0;

        result[action] = {
            daily,
            insights: {
                totalCount,
                totalTimeTaken: totalTime,
                averagePerDay,
                averageTimePerEvent,
                mostActiveDay,
                daysTracked: days.length,
            },
        };
    }

    return result;
}
