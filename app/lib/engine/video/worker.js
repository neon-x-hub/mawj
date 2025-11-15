import fs from "fs/promises";
import path from "path";
import { RenderContext } from "./stages/RenderContext.js";
import { AudioStage } from "./stages/AudioStage.js";
import { ThumbnailStage } from "./stages/ThumbnailStage.js";
import { VideoStage } from "./stages/VideoStage.js";
import { MetadataStage } from "./stages/MetadataStage.js";
import { CleanupStage } from "./stages/CleanupStage.js";
import datarows from "../../providers/datarows/index.js";
import stats from "../../helpers/stats/index.js";
import config from "../../providers/config/index.js";
import { MetadataProvider, revalidators } from "@/app/lib/fam";

export async function workerVideoRenderer(jobData, onProgress) {
    const { project, template, rows, options } = jobData;

    const dataDir = await config.get("baseFolder") || "./data";
    const dataRowsProvider = await datarows.getDataProvider();

    // Metadata
    const metadata = new MetadataProvider({
        filePath: `${dataDir}/datarows/${project.id}/fam.json`,
        revalidators,
        provider: dataRowsProvider,
    });
    await metadata.load({ projectId: project.id });

    // prepare context
    const ctx = new RenderContext({
        project,
        template,
        rows,
        options,
        dataDir,
        dataRowsProvider,
        metadata
    });

    ctx.tmpDirs = {
        audio: path.join(dataDir, "projects", "outputs", project.id, "temp_audio"),
        bg: path.join(dataDir, "projects", "outputs", project.id, "temp_bg"),
        thumbnails: path.join(dataDir, "projects", "outputs", project.id, "thumbnails"),
    };

    for (const dir of Object.values(ctx.tmpDirs))
        await fs.mkdir(dir, { recursive: true });

    const stages = [
        new AudioStage(),
        new ThumbnailStage(),
        new VideoStage(),
        new MetadataStage(),
    ];

    for (const row of rows) {
        ctx.setCurrentRow(row);
        for (const stage of stages) {
            await stage.run(ctx);
        }

        ctx.updateProgress(++ctx.completed, rows.length, onProgress);
    }

    // cleanup
    const cleanup = new CleanupStage();
    await cleanup.run(ctx);

    !options.liveGen && stats.add({
        projectId: project.id,
        action: "generation",
        data: { timeTaken: Date.now() - jobData.startTime, count: ctx.completed },
    });

    return ctx.completed;
}
