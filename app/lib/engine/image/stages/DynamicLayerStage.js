import { Stage } from "./Stage.js";
import { buildLayer } from "../../../layers/types";


export class DynamicLayerStage extends Stage {
    constructor() {
        super("DynamicLayerStage");
    }

    async run(ctx) {
        // dynamically import react-dom/server here to avoid loading it in non-dynamic stages
        const { renderToString } = await import("react-dom/server");
        if (!ctx.page) throw new Error("Page not initialized in context");
        if (!ctx.currentRow || !ctx.currentRow.resolvedLayers) return;

        // clear previous dyn container
        await ctx.page.evaluate(() => {
            const old = document.getElementById("dynamic-container");
            if (old) old.remove();
            const container = document.getElementById("canvas");
            const wrapper = document.createElement("div");
            wrapper.id = "dynamic-container";
            container.appendChild(wrapper);
        });

        for (const layerConfig of ctx.currentRow.resolvedLayers) {
            const layer = buildLayer(layerConfig.id, layerConfig);
            const htmlString = renderToString(layer.renderContent({ node_key: layerConfig.id }));

            await ctx.page.evaluate((html) => {
                const container = document.getElementById("dynamic-container");
                const fragment = document.createRange().createContextualFragment(html);
                container.appendChild(fragment);
            }, htmlString);
        }
    }
}
