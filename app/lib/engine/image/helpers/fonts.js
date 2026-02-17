import makeCssFontName from '../../../fonts/cssName.js';
import { getFontByFamilyAndStyle } from '@/app/lib/fonts/manager.js';
import { loadFontInPuppeteer } from '../injectFont.js';

export function collectFontsFromLayers(layers) {
    const fonts = new Map();

    for (const layer of layers) {
        if (layer.type !== 'text') continue;

        const props = layer.options?.props;
        if (!props?.fontFamily) continue;

        const family = props.fontFamily;
        const style = props.fontFamilyStyle || 'Regular';
        const cssName = makeCssFontName(family, style);

        if (!fonts.has(cssName)) {
            fonts.set(cssName, {
                family,
                style,
                cssName
            });
        }
    }

    return Array.from(fonts.values());
}

export async function loadProjectFonts(page, layers) {
    const neededFonts = collectFontsFromLayers(layers);

    for (const { family, style, cssName } of neededFonts) {
        const font = await getFontByFamilyAndStyle(family, style);

        if (!font) {
            console.warn(`⚠️ Font not found: ${family} (${style})`);
            continue;
        }

        await loadFontInPuppeteer(page, font, cssName);
    }
}
