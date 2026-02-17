import { Stage } from "./Stage.js";
import path from "path";
import fs from "fs";

export class CaptureStage extends Stage {
    constructor() {
        super("CaptureStage");
    }

    async run(ctx) {
        if (!ctx.page) throw new Error("Page not initialized in context");
        if (!ctx.currentRow) throw new Error("No current row in context");

        const options = ctx.options || {};
        const outputDir =
            options.outputDir ||
            path.resolve(`${ctx.dataDir}/projects/outputs/${ctx.project.id}`);
        fs.mkdirSync(outputDir, { recursive: true });

        const fileName = options.outputName || `${ctx.currentRow.id}.${options.format || "png"}`;
        const outputPath = path.join(outputDir, fileName);

        const type = options.format === "jpg" ? "jpeg" : options.format || "png";
        const screenshotOptions = { type, path: outputPath, omitBackground: true };

        if (type === "jpeg") {
            screenshotOptions.quality = options.quality || 80;
        }

        await ctx.page.screenshot(screenshotOptions);

        // save artifact in ctx
        ctx.artifacts.rows.push({ rowId: ctx.currentRow.id, output: outputPath });

        this.log(`Rendered and captured row: ${ctx.currentRow.id} → ${outputPath}`);

    }
}
