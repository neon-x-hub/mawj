import { Stage } from "./Stage.js";

export class LayoutProbeEvaluateStage extends Stage {
    constructor(layerId) {
        super("LayoutProbeEvaluateStage");
        this.layerId = layerId;
    }

    async run(ctx) {
        if (!ctx.page) throw new Error("Page not initialized");

        const fits = await ctx.page.evaluate((layerId) => {
            const el = document.getElementById(`text-layer-${layerId}`);
            if (!el) throw new Error("Target layer not found");

            return (
                el.scrollHeight <= el.clientHeight &&
                el.scrollWidth <= el.clientWidth
            );
        }, this.layerId);

        ctx.layoutProbeState.fits = fits;
    }
}
