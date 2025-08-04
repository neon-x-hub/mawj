import fs from 'fs';
import path from 'path';
import * as fontkit from 'fontkit';

const USER_FONT_DIR = path.join(process.env.USERPROFILE || process.env.HOME, 'AppData/Local/Microsoft/Windows/Fonts');

export function scanUserFonts() {
    const results = [];
    if (!fs.existsSync(USER_FONT_DIR)) return results;

    for (const file of fs.readdirSync(USER_FONT_DIR)) {
        if (/\.(ttf|otf|ttc)$/i.test(file)) {
            results.push({ file, dir: USER_FONT_DIR });
        }
    }
    return results;
}

export function getFamilyFromFile(filePath) {
    try {
        const font = fontkit.openSync(filePath);
        return font.familyName?.trim() || null;
    } catch {
        return null;
    }
}

export async function collectFonts() {
    const fontMap = new Map();
    const files = scanUserFonts();

    for (const { file, dir } of files) {
        const fullPath = path.join(dir, file);
        const family = getFamilyFromFile(fullPath);
        if (family && !fontMap.has(family)) {
            fontMap.set(family, {
                name: family,
                file,
                fullPath,
                servable: true,
                url: `/api/v1/fonts/file?file=${encodeURIComponent(file)}`
            });
        }
    }

    return Array.from(fontMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFontByName(fontName) {
    const fonts = await collectFonts();
    return fonts.find(f => f.name.toLowerCase() === fontName.toLowerCase()) || null;
}
