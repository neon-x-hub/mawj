import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import ReactDOMServer from 'react-dom/server';
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
        await loadFontInPuppeteer(page, font.name, font.url);
    }
}

export async function render(project, text = {}, options = { format: 'png' }) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // 1. Load Base HTML
    const baseHTML = fs.readFileSync(path.resolve('./app/lib/engine/image/base.html'), 'utf8');
    await page.setContent(baseHTML);

    // 2. Set Canvas
    const baseLayer = project.baseLayers[0];
    await page.evaluate(({ width, height, name, template, BASE_URL }) => {
        const canvas = document.getElementById('canvas');
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.background = `url('${BASE_URL}/api/v1/templates/${template}/base/${name}') center/cover no-repeat`;
    }, { ...baseLayer, template: project.template, BASE_URL });

    // 3. Load Fonts
    await loadProjectFonts(page, project.layers);

    // 4. Render Layers
    for (const layerConfig of project.layers) {

        // ✅ Hydrate templateText (if exists) with provided text object
        if (layerConfig.options?.props?.templateText) {
            const template = layerConfig.options.props.templateText;
            const hydrated = Mustache.render(template, text || {});
            layerConfig.options.props.content = hydrated; // set final content
        }

        const layer = buildLayer(layerConfig);
        const htmlString = ReactDOMServer.renderToString(layer.renderContent({ node_key: layerConfig.id }));

        // Inject into Puppeteer
        await page.evaluate((html) => {
            const container = document.getElementById('canvas');
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            container.appendChild(wrapper.firstChild);
        }, htmlString);
    }

    // 5. Wait for fonts
    await page.evaluateHandle('document.fonts.ready');

    // 6. Capture Screenshot
    const outputPath = `./data/projects/outputs/${project.id}.${options.format}`;
    await page.screenshot({
        path: outputPath,
        type: options.format === 'png' ? 'png' : 'jpeg',
        clip: { x: 0, y: 0, width: baseLayer.width, height: baseLayer.height }
    });

    console.log(`✅ Rendered project ${project.id} → ${outputPath}`);
    await browser.close();
}
