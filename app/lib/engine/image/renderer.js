import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import Mustache from 'mustache';

import { buildLayer } from '../../layers/types/index.js';
import { loadFontInPuppeteer } from './injectFont.js';
import { getFontByName } from '../../fonts/manager.js';

const BASE_URL = process.env.ASSET_HOST || 'http://localhost:3000';

function collectFontsFromLayers(layers) {
    const fonts = new Set();
    for (const layer of layers) {
        if (layer.type === 'text' && layer.options?.props?.fontFamily) {
            fonts.add(layer.options.props.fontFamily);
        }
    }
    return Array.from(fonts);
}

async function loadProjectFonts(page, layers) {
    const fontFamilies = collectFontsFromLayers(layers);
    for (const fontName of fontFamilies) {
        const font = await getFontByName(fontName);
        if (!font) {
            console.warn(`⚠️ Font not found: ${fontName}`);
            continue;
        }
        await loadFontInPuppeteer(page, font.name, BASE_URL + font.url);
    }
}

export async function render(
    project,
    template,
    rows = [],
    options = { format: 'png' },
    onRowRenderCompleted
) {
    const { renderToString } = await import('react-dom/server');
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    const page = await browser.newPage();

    // ✅ 1. Set viewport once (no clip needed later)
    const baseLayer = template.baseLayers[0];
    await page.setViewport({ width: baseLayer.width, height: baseLayer.height });

    // ✅ 2. Load Base HTML once
    const baseHTML = fs.readFileSync(path.resolve('./app/lib/engine/image/base.html'), 'utf8');
    await page.setContent(baseHTML);

    // ✅ 3. Set Canvas background
    await page.evaluate(({ width, height, name, templateId, BASE_URL }) => {
        const canvas = document.getElementById('canvas');
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.background = `url('${BASE_URL}/api/v1/templates/${templateId}/base/${name}') center/cover no-repeat`;
    }, { ...baseLayer, templateId: template.id, BASE_URL });

    // ✅ Wait for background to load
    await page.evaluate(() => new Promise((resolve) => {
        const canvas = document.getElementById('canvas');
        const url = canvas.style.background.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
        if (!url) return resolve(true);
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    }));

    // ✅ 4. Load all fonts once
    await loadProjectFonts(page, template.layers);

    // ✅ 5. Prepare output directory
    const outputDir = path.resolve(`./data/projects/outputs/${project.id}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const startTime = Date.now();
    const results = [];

    // ✅ 6. Separate static and dynamic layers
    const staticLayers = template.layers.filter(l => !l.options?.props?.templateText);
    const dynamicLayers = template.layers.filter(l => l.options?.props?.templateText);

    // ✅ 7. Render static layers once and keep them in DOM
    async function renderLayers(page, layers) {
        for (const layerConfig of layers) {
            const layer = buildLayer(layerConfig.id, layerConfig);
            const htmlString = renderToString(layer.renderContent({ node_key: layerConfig.id }));

            await page.evaluate((html) => {
                const container = document.getElementById('canvas');
                const wrapper = document.createElement('div');
                wrapper.classList.add('static-layer');
                wrapper.innerHTML = html;
                container.appendChild(wrapper.firstChild);
            }, htmlString);
        }
    }

    await renderLayers(page, staticLayers);

    // ✅ 8. Render each row (only dynamic layers change)
    for (const row of rows) {
        console.log(`Rendering row ${row.id}...`);
        const preprocessedRow = {
            id: row.id,
            ...Object.fromEntries(Object.entries(row.data || {}).map(([k, v]) => [k.replace(/\s+/g, '_'), v]))
        };

        // Clear dynamic container
        await page.evaluate(() => {
            const old = document.getElementById('dynamic-container');
            if (old) old.remove();
            const container = document.getElementById('canvas');
            const wrapper = document.createElement('div');
            wrapper.id = 'dynamic-container';
            container.appendChild(wrapper);
        });

        console.log("Dynamic container cleared");

        // Render only dynamic layers for this row
        for (const layerConfig of dynamicLayers) {
            // Clone props so they don't overwrite original
            const clonedConfig = {
                ...layerConfig,
                options: { ...layerConfig.options, props: { ...layerConfig.options.props } }
            };

            if (clonedConfig.options.props.templateText) {
                const mustacheTemplate = clonedConfig.options.props.templateText;
                clonedConfig.options.props.content = Mustache.render(mustacheTemplate, preprocessedRow);
            }

            const layer = buildLayer(clonedConfig.id, clonedConfig);
            const htmlString = renderToString(layer.renderContent({ node_key: clonedConfig.id }));

            console.log("Dynamic layer rendered to string");


            await page.evaluate((html) => {
                const container = document.getElementById('dynamic-container');
                const wrapper = document.createElement('div');
                wrapper.classList.add('dynamic-layer');
                wrapper.innerHTML = html;
                container.appendChild(wrapper.firstChild);
            }, htmlString);
        }

        // Wait for fonts to settle
        await page.evaluateHandle('document.fonts.ready');

        console.log("Fonts settled");


        // ✅ 9. Screenshot without clip (viewport already matches canvas)
        const fileName = `${row.id}.${options.format}`;
        const outputPath = path.join(outputDir, fileName);


        const screenshotOptions = {
            type: options.format === 'jpg' ? 'jpeg' : (options.format || 'png'),
        };

        // JPG-specific settings
        if (screenshotOptions.type === 'jpeg') {
            screenshotOptions.quality = options.quality || 30; // required to avoid Chromium stall
            screenshotOptions.omitBackground = true; // flatten transparency
        }

        screenshotOptions.path = outputPath;

        // Safe capture
        await page.screenshot(screenshotOptions);

        console.log("Screenshot taken");

        results.push({ rowId: row.id, output: outputPath });

        if (typeof onRowRenderCompleted === 'function') {
            onRowRenderCompleted(row.id, outputPath);
        }

        console.log(`✅ Rendered row ${row.id} to ${outputPath}`);
    }

    // ✅ 10. Cleanup
    await browser.close();
    console.log(`==== Rendered ${results.length} rows in ${Date.now() - startTime}ms`);
    return results;
}
