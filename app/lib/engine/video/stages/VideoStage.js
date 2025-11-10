import path from "path";
import { Stage } from "./Stage.js";
import { render as renderVideo } from "../../video/renderer.js";

export class VideoStage extends Stage {
    constructor() {
        super("VideoStage");
    }

    async run(ctx) {
        const { project, currentRow: row, options, dataDir, audioPath, thumbnailPath } = ctx;
        if (!audioPath || !thumbnailPath) {
            this.log(`Skipping row ${row.id} due to missing assets.`);
            return;
        }

        const outputPath = path.join(
            dataDir,
            "projects",
            "outputs",
            project.id,
            `${row.id}.${options.format}`
        );

        ctx.outputPath = outputPath;

        this.log(`Rendering video: ${outputPath}`);
        await renderVideo(thumbnailPath, audioPath, outputPath, options);
    }
}
