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

        // --- Extract fade durations from modifier ---
        let fadeInDuration = 0;
        let fadeOutDuration = 0;

        const fadeModifier = (ctx.template.modifiers || []).find(m => m.type === "fade");
        if (fadeModifier?.options?.props) {
            fadeInDuration = fadeModifier.options.props.fadeInDuration ?? 0;
            fadeOutDuration = fadeModifier.options.props.fadeOutDuration ?? 0;
        }

        const outputPath = options.outputDir ?
            path.join(options.outputDir, `${row.id}.${options.format}`)
            : path.join(
                dataDir,
                "projects",
                "outputs",
                project.id,
                `${row.id}.${options.format}`
            );

        ctx.outputPath = outputPath;

        this.log(`Rendering video: ${outputPath}`);

        // --- Call render with fade options ---
        await renderVideo(thumbnailPath, audioPath, outputPath, {
            ...options,
            fadeInDuration,
            fadeOutDuration
        });
    }
}
