import { Stage } from "./Stage.js";

export class StabilityStage extends Stage {
    constructor() {
        super("StabilityStage");
    }

    async run(ctx) {
        if (!ctx.page) throw new Error("Page not initialized in context");

        // wait for fonts to be ready
        await ctx.page.evaluateHandle("document.fonts.ready");

        // wait for all images to load
        await ctx.page.evaluate(() => {
            const images = Array.from(document.querySelectorAll("#canvas img"));
            return Promise.all(
                images.map(img =>
                    img.complete
                        ? img.naturalHeight !== 0
                        : new Promise((resolve) => {
                              img.onload = () => resolve(true);
                              img.onerror = () => resolve(false);
                          })
                )
            );
        });
    }
}
