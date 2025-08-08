import { queue } from "../../queue";
import { workerExporter } from "./worker";

export function enqueueExportJob(jobData) {
    return queue.addJob(jobData, workerExporter);
}
