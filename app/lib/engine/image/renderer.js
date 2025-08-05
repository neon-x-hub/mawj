// lib/engine/image/renderer.js
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import Mustache from 'mustache';

import { buildLayer } from '../../layers/types/index.js';
import { loadFontInPuppeteer } from './injectFont.js';
import { getFontByName } from '../../fonts/manager.js';
import generateId from '../../id/generate.js';

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

/**
 * Bulk renderer: renders all datarows using one Puppeteer instance.
 */
export async function render(
    project,
    template,
    rows = [],
    options = { format: 'png' },
    onRowRenderCompleted
) {
    const { renderToString } = await import('react-dom/server');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // 1. Load Base HTML once
    const baseHTML = fs.readFileSync(path.resolve('./app/lib/engine/image/base.html'), 'utf8');
    await page.setContent(baseHTML);

    // 2. Set Canvas background
    const baseLayer = template.baseLayers[0];
    await page.evaluate(({ width, height, name, templateId, BASE_URL }) => {
        const canvas = document.getElementById('canvas');
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.background = `url('${BASE_URL}/api/v1/templates/${templateId}/base/${name}') center/cover no-repeat`;
    }, { ...baseLayer, templateId: template.id, BASE_URL });

    // ✅ Wait for the base background image to finish loading
    await page.evaluate(() => {
        return new Promise((resolve) => {
            const canvas = document.getElementById('canvas');
            const url = canvas.style.background.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
            if (!url) return resolve(true);
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    });

    // 3. Load all required fonts once
    await loadProjectFonts(page, template.layers);

    // 4. Ensure output directory exists
    const outputDir = path.resolve(`./data/projects/outputs/${project.id}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const results = [];

    // 5. Render rows sequentially
    for (const row of rows) {
        // ✅ Preprocess row keys (spaces -> underscores)
        const preprocessedRow = {
            id: row.id,
            ...Object.fromEntries(
                Object.entries(row.data || {}).map(([key, value]) => [
                    key.replace(/\s+/g, '_'),
                    value
                ])
            )
        };


        // ✅ Clear previous row’s dynamic layers completely
        await page.evaluate(() => {
            const old = document.getElementById('row-container');
            if (old) old.remove();
            const container = document.getElementById('canvas');
            const wrapper = document.createElement('div');
            wrapper.id = 'row-container';
            container.appendChild(wrapper);
        });

        // ✅ Render all layers for this row
        for (const layerConfig of template.layers) {
            layerConfig.options.props.content = '';

            if (layerConfig.options?.props?.templateText) {
                const mustacheTemplate = layerConfig.options.props.templateText;
                const hydrated = Mustache.render(mustacheTemplate, preprocessedRow || {});
                layerConfig.options.props.content = hydrated;
            }

            const layer = buildLayer(layerConfig.id, layerConfig);
            const htmlString = renderToString(layer.renderContent({ node_key: layerConfig.id }));

            await page.evaluate((html) => {
                const container = document.getElementById('row-container');
                const wrapper = document.createElement('div');
                wrapper.classList.add('dynamic-layer');
                wrapper.innerHTML = html;
                container.appendChild(wrapper.firstChild);
            }, htmlString);
        }

        // ✅ Wait for fonts before taking screenshot
        await page.evaluateHandle('document.fonts.ready');

        // ✅ Capture screenshot
        const fileName = `${row.id}.${options.format}`;
        const outputPath = path.join(outputDir, fileName);

        await page.screenshot({
            path: outputPath,
            type: options.format === 'png' ? 'png' : 'jpeg',
            clip: { x: 0, y: 0, width: baseLayer.width, height: baseLayer.height }
        });

        results.push({ rowId: row.id, output: outputPath });

        if (typeof onRowRenderCompleted === 'function') {
            onRowRenderCompleted(row.id, outputPath);
        }

    }

    // ✅ Close browser once after all rows are processed
    await browser.close();
    return results;
}
