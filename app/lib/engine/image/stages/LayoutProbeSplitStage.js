import { Stage } from "./Stage.js";

export class LayoutProbeSplitStage extends Stage {
    constructor(layerId) {
        super("LayoutProbeSplitStage");
        this.layerId = layerId;
    }

    run(ctx) {
        const state = ctx.layoutProbeState;
        if (!state) throw new Error("layoutProbeState not initialized");

        const layer = ctx.currentRow.resolvedLayers.find(l => l.id === this.layerId);
        if (!layer) throw new Error(`Layer "${this.layerId}" not found`);

        const { tokens, candidateSize } = state;

        layer.options.props.content = tokens
            .slice(0, candidateSize)
            .join(" ");
    }
}
