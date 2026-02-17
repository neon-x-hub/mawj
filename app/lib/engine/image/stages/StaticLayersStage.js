import { Stage } from "./Stage.js";
import { buildLayer } from "../../../layers/types";

export class StaticLayersStage extends Stage {
    constructor() {
        super("StaticLayersStage");
    }

    async run(ctx) {

        const { renderToString } = await import("react-dom/server");
        if (!ctx.page) throw new Error("Page not initialized in context");

        const staticLayers = ctx.template.layers.filter(l => !l.options?.props?.templateText);

        for (const layerConfig of staticLayers) {
            const layer = buildLayer(layerConfig.id, layerConfig);
            const htmlString = renderToString(layer.renderContent({ node_key: layerConfig.id }));

            await ctx.page.evaluate((html) => {
                const container = document.getElementById("canvas");
                const wrapper = document.createElement("div");
                wrapper.classList.add("static-layer");
                wrapper.innerHTML = html;
                container.appendChild(wrapper.firstChild);
            }, htmlString);
        }
    }
}
