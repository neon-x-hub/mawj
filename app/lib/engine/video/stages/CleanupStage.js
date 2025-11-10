import fs from "fs/promises";
import { Stage } from "./Stage.js";

export class CleanupStage extends Stage {
    constructor() {
        super("CleanupStage");
    }

    async run(ctx) {
        const { tmpDirs, options } = ctx;

        // Thumbnails
        if (!options.keepThumbnails) {
            try {
                await fs.rm(tmpDirs.thumbnails, { recursive: true, force: true });
                this.log("Deleted thumbnails folder");
            } catch (err) {
                this.log(`Failed to delete thumbnails: ${err.message}`);
            }
        }

        // Backgrounds
        try {
            await fs.rm(tmpDirs.bg, { recursive: true, force: true });
            this.log("Deleted background temp folder");
        } catch (err) {
            this.log(`Failed to delete bg folder: ${err.message}`);
        }

        // Audio
        try {
            await fs.rm(tmpDirs.audio, { recursive: true, force: true });
            this.log("Deleted audio temp folder");
        } catch (err) {
            this.log(`Failed to delete audio temp: ${err.message}`);
        }
    }
}
