import { RenderContext } from "./stages/RenderContext.js";
import { Pipeline } from "./stages/Pipeline.js";

// Setup
import { BrowserStage } from "./stages/BrowserStage.js";
import { CanvasStage } from "./stages/CanvasStage.js";
import { FontStage } from "./stages/FontStage.js";
import { StaticLayersStage } from "./stages/StaticLayersStage.js";

// Per-row
import { RowContextStage } from "./stages/RowContextStage.js";
import { DynamicLayerStage } from "./stages/DynamicLayerStage.js";
import { StabilityStage } from "./stages/StabilityStage.js";
import { CaptureStage } from "./stages/CaptureStage.js";

// Teardown
import { CleanupStage } from "./stages/CleanupStage.js";

export async function render(project, template, rows = [], options = {}, onProgress) {
    const ctx = new RenderContext({ project, template, rows, options, onProgress });

    const setupPipeline = new Pipeline([
        new BrowserStage(),
        new CanvasStage(),
        new FontStage(),
        new StaticLayersStage(),
    ]);

    await setupPipeline.run(ctx);

    const perRowPipeline = new Pipeline([
        new RowContextStage(),
        new DynamicLayerStage(),
        new StabilityStage(),
        new CaptureStage(),
    ]);

    for (const row of rows) {
        ctx.setCurrentRow(row);
        await perRowPipeline.run(ctx);
        ctx.commitRowProgress(row.id);
    }

    const teardownPipeline = new Pipeline([
        new CleanupStage(),
    ]);

    await teardownPipeline.run(ctx);

    return ctx.artifacts;
}
