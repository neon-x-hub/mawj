import getProjectStats from "./get";
import addProjectStatsEvent from "./add";
import analyzeProjectStats from "./analyse";

const stats = {
    get: getProjectStats,
    add: addProjectStatsEvent,
    analyze: analyzeProjectStats,
}

export default stats;
