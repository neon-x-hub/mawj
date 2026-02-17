import { Stage } from "./Stage.js";
import Mustache from "mustache";
import he from "he";
import fs from "fs";
import path from "path";
import fetchImageAsDataURL from "../../../helpers/images/downloadToBase64.js";
import localFileToDataURL from "../../../helpers/images/readFromFsToBase64.js";

export class RowContextStage extends Stage {
    constructor() {
        super("RowContextStage");
    }

    async run(ctx) {
        if (!ctx.currentRow) throw new Error("No current row in context");

        // normalize row keys (spaces → underscores)
        const preprocessedRow = {
            id: ctx.currentRow.id,
            ...Object.fromEntries(
                Object.entries(ctx.currentRow.data || {}).map(([k, v]) => [k.replace(/\s+/g, "_"), v])
            )
        };

        ctx.currentRow.preprocessed = preprocessedRow;

        // resolve mustache templates for image/text layers
        const dynamicLayers = ctx.template.layers.filter(l => l.options?.props?.templateText);

        ctx.currentRow.resolvedLayers = [];

        for (const layerConfig of dynamicLayers) {
            const clonedConfig = structuredClone(layerConfig);
            const templateText = clonedConfig.options.props.templateText;

            if (templateText) {
                let content = he.decode(Mustache.render(templateText, preprocessedRow));

                // For images, resolve URLs or local files
                if (clonedConfig.type === "image" && typeof content === "string") {
                    try {
                        if (content.startsWith("http://") || content.startsWith("https://")) {
                            content = await fetchImageAsDataURL(content);
                        } else if (fs.existsSync(content)) {
                            content = await localFileToDataURL(path.resolve(content));
                        }
                        // else: leave as-is
                    } catch (err) {
                        console.warn(`⚠️ Failed to resolve image "${content}": ${err.message}`);
                    }
                }

                clonedConfig.options.props.content = content;
            }

            ctx.currentRow.resolvedLayers.push(clonedConfig);
        }
    }
}
