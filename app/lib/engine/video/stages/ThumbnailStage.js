import path from "path";
import { Stage } from "./Stage.js";
import { render as renderImage } from "../../image/renderer.js";
import modifierHandlers from "../../../modifiers/handlers/index.js";

export class ThumbnailStage extends Stage {
    constructor() {
        super("ThumbnailStage");
    }

    async run(ctx) {
        const { project, template, currentRow: row, dataDir, options } = ctx;
        const tempBgDir = ctx.tmpDirs.bg;
        const thumbnailDir = ctx.tmpDirs.thumbnails;

        let thumbnailPath = null;
        const bgModifier = (template.modifiers || []).find(m => m.type === "bgctrl");

        if (bgModifier) {
            try {
                thumbnailPath = await modifierHandlers["bgctrl"]({
                    row,
                    project,
                    template,
                    modifier: bgModifier,
                    tmpDir: tempBgDir,
                    options,
                });
            } catch (err) {
                this.log(`bgctrl failed for row ${row.id}: ${err.message}`);
            }
        }

        if (!thumbnailPath) {
            const out = await renderImage(
                project,
                template,
                [row],
                { outputDir: thumbnailDir, format: "png" },
                () => { }
            );
            thumbnailPath = out.rows[0].output;
        }

        ctx.thumbnailPath = thumbnailPath;
    }
}
