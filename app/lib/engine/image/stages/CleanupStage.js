import { Stage } from "./Stage.js";
import fs from "fs";
//import path from "path";

export class CleanupStage extends Stage {
    constructor() {
        super("CleanupStage");
    }

    async run(ctx) {
        if (ctx.browser) {
            try {
                await ctx.browser.close();
            } catch (err) {
                console.warn("⚠️ Failed to close browser:", err.message);
            }
            ctx.browser = null;
            ctx.page = null;
        }

        // clean temporary directories
        if (ctx.tmpDirs) {
            for (const dir of Object.values(ctx.tmpDirs)) {
                try {
                    if (fs.existsSync(dir)) {
                        fs.rmSync(dir, { recursive: true, force: true });
                    }
                } catch (err) {
                    console.warn(`⚠️ Failed to cleanup temp dir "${dir}":`, err.message);
                }
            }
        }

        // You could also clear artifacts if you want
        // ctx.artifacts = { rows: [], frames: [], metadata: {} };
    }
}
