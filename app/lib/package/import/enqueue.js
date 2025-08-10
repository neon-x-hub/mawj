import { queue } from "../../queue";
import { workerImporter } from "./worker";

export function enqueueImportJob(jobData) {
    return queue.addJob(jobData, workerImporter);
}
