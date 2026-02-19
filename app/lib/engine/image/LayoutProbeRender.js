import { RenderContext } from "./stages/RenderContext.js";
import { Pipeline } from "./stages/Pipeline.js";

import { BrowserStage } from "./stages/BrowserStage.js";
import { CanvasStage } from "./stages/CanvasStage.js";
import { FontStage } from "./stages/FontStage.js";
import { StaticLayersStage } from "./stages/StaticLayersStage.js";

import { RowContextStage } from "./stages/RowContextStage.js";
import { DynamicLayerStage } from "./stages/DynamicLayerStage.js";
import { StabilityStage } from "./stages/StabilityStage.js";

import { LayoutProbeSplitStage } from "./stages/LayoutProbeSplitStage.js";
import { LayoutProbeEvaluateStage } from "./stages/LayoutProbeEvaluateStage.js";

import { CleanupStage } from "./stages/CleanupStage.js";


export async function layoutProbeRender({
    project,
    template,
    layerId,
    row,
    options = {},
}) {
    template.layers = template.layers.filter(l => l.id === layerId);
    const filteredTemplate = template;

    const ctx = new RenderContext({
        project,
        template: filteredTemplate,
        rows: [row],
        options: { ...options, mode: "layout-probe" },
    });

    await new Pipeline([
        new BrowserStage(),
        new CanvasStage(),
        new FontStage(),
        new StaticLayersStage(),
    ]).run(ctx);

    ctx.setCurrentRow(row);
    await new RowContextStage().run(ctx);

    const layer = ctx.currentRow.resolvedLayers.find(l => l.id === layerId);
    if (!layer) throw new Error(`Layer "${layerId}" not resolved`);

    const fullContent = layer.options.props.content;
    if (typeof fullContent !== "string") {
        throw new Error("LayoutProbe only supports string content (for now)");
    }

    ctx.layoutProbeState = {
        tokens: fullContent.trim().split(/\s+/),
        accepted: [],
        low: 0,
        high: 0,
        best: 0,
        candidateSize: 0,
        fits: false,
    };

    const splitStage = new LayoutProbeSplitStage(layerId);
    const renderStage = new DynamicLayerStage();
    const stabilityStage = new StabilityStage();
    const evaluateStage = new LayoutProbeEvaluateStage(layerId);

    while (ctx.layoutProbeState.tokens.length > 0) {
        const state = ctx.layoutProbeState;

        state.low = 1;
        state.high = state.tokens.length;
        state.best = 0;

        while (state.low <= state.high) {
            const mid = (state.low + state.high) >> 1;
            state.candidateSize = mid;

            splitStage.run(ctx);
            await renderStage.run(ctx);
            await stabilityStage.run(ctx);
            await evaluateStage.run(ctx);

            if (state.fits) {
                state.best = mid;
                state.low = mid + 1;
            } else {
                state.high = mid - 1;
            }
        }

        // always make progress
        if (state.best === 0) state.best = 1;

        const chunk = state.tokens.slice(0, state.best).join(" ");
        state.accepted.push(chunk);

        state.tokens = state.tokens.slice(state.best);
    }

    ctx.artifacts.layoutProbe = {
        layerId,
        chunks: ctx.layoutProbeState.accepted,
    };

    await new CleanupStage().run(ctx);

    return ctx.artifacts.layoutProbe;
}
