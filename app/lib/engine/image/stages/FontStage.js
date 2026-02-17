import { Stage } from "./Stage.js";
import { loadProjectFonts } from "../helpers/fonts.js";

export class FontStage extends Stage {
    constructor() {
        super("FontStage");
    }

    async run(ctx) {
        if (!ctx.page) throw new Error("Page not initialized in context");
        await loadProjectFonts(ctx.page, ctx.template.layers);
    }
}
