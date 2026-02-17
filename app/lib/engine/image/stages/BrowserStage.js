import puppeteer from "puppeteer";
import { Stage } from "./Stage.js";

export class BrowserStage extends Stage {
    constructor() {
        super("BrowserStage");
    }

    async run(ctx) {
        const baseLayer = ctx.template.baseLayers[0];

        ctx.browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--allow-file-access-from-files",
                "--enable-local-file-accesses"
            ]
        });

        ctx.page = await ctx.browser.newPage();
        await ctx.page.setViewport({ width: baseLayer.width, height: baseLayer.height });

        // Load base HTML
        const fs = await import("fs/promises");
        const path = await import("path");
        const baseHTMLPath = path.resolve("./app/lib/engine/image/base.html");
        const baseHTML = await fs.readFile(baseHTMLPath, "utf8");
        await ctx.page.setContent(baseHTML);
    }
}
