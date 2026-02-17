import { Stage } from "./Stage.js";
import fs from "fs";

export class CanvasStage extends Stage {
    constructor() {
        super("CanvasStage");
    }

    async run(ctx) {
        const page = ctx.page;
        const baseLayer = ctx.template.baseLayers[0];
        let backgroundDataURL = null;

        if (ctx.options.baseLayer && fs.existsSync(ctx.options.baseLayer)) {
            const localFileToDataURL = (
                await import("../../../helpers/images/readFromFsToBase64.js")
            ).default;

            try {
                backgroundDataURL = await localFileToDataURL(ctx.options.baseLayer);
            } catch (err) {
                console.warn("⚠️ Failed to load custom base layer:", err.message);
            }
        }

        if (backgroundDataURL) {
            await page.evaluate(
                ({ width, height, backgroundDataURL }) => {
                    const canvas = document.getElementById("canvas");
                    if (!canvas) return;

                    canvas.style.width = `${width}px`;
                    canvas.style.height = `${height}px`;
                    canvas.style.background = `url("${backgroundDataURL}") center / cover no-repeat`;

                    document.documentElement.style.background = "transparent";
                    document.body.style.background = "transparent";
                },
                {
                    width: baseLayer.width,
                    height: baseLayer.height,
                    backgroundDataURL,
                }
            );
        } else {
            const BASE_URL = process.env.ASSET_HOST || "http://localhost:3000";

            await page.evaluate(
                ({ width, height, name, templateId, BASE_URL }) => {
                    const canvas = document.getElementById("canvas");
                    if (!canvas) return;

                    canvas.style.width = `${width}px`;
                    canvas.style.height = `${height}px`;
                    canvas.style.background = `url("${BASE_URL}/api/v1/templates/${templateId}/base/${name}") center / cover no-repeat`;
                },
                {
                    width: baseLayer.width,
                    height: baseLayer.height,
                    name: baseLayer.name,
                    templateId: ctx.template.id,
                    BASE_URL,
                }
            );
        }

        // until bg img is fully loaded
        await page.evaluate(() => {
            return new Promise(resolve => {
                const canvas = document.getElementById("canvas");
                if (!canvas) return resolve(true);

                const match = canvas.style.background.match(/url\(["']?(.*?)["']?\)/);
                const url = match?.[1];
                if (!url) return resolve(true);

                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            });
        });
    }
}
