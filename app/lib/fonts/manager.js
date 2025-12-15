import fs from 'fs';
import path from 'path';
import * as fontkit from 'fontkit';

const USER_FONT_DIR = path.join(process.env.USERPROFILE || process.env.HOME, 'AppData/Local/Microsoft/Windows/Fonts');

const FONT_EXT_RE = /\.(ttf|otf|ttc)$/i;

function scanDirRecursive(dir, results) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirRecursive(fullPath, results);
        } else if (entry.isFile() && FONT_EXT_RE.test(entry.name)) {
            results.push({
                file: entry.name,
                dir
            });
        }
    }
}

export function scanUserFonts() {
    const results = [];
    if (!fs.existsSync(USER_FONT_DIR)) return results;

    scanDirRecursive(USER_FONT_DIR, results);
    return results;
}

export function getFontInfoFromFile(filePath) {
    try {
        const font = fontkit.openSync(filePath);

        return {
            family: font.familyName?.trim() || null,
            subfamily: font.subfamilyName?.trim() || 'Regular',
            postscript: font.postscriptName || null
        };
    } catch {
        return null;
    }
}


export async function collectFonts() {
    const fontMap = new Map();
    const files = scanUserFonts();

    for (const { file, dir } of files) {
        const fullPath = path.join(dir, file);
        const info = getFontInfoFromFile(fullPath);
        if (!info || !info.family) continue;

        const key =
            info.postscript ||
            `${info.family}-${info.subfamily}`;

        if (!fontMap.has(key)) {
            fontMap.set(key, {
                name: info.family,
                style: info.subfamily,
                postscript: info.postscript,
                file,
                fullPath,
                servable: true,
                url: `/api/v1/fonts/file?file=${encodeURIComponent(file)}`
            });
        }
    }

    return Array.from(fontMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name) ||
        a.style.localeCompare(b.style)
    );
}


export async function getFontByName(fontName) {
    const fonts = await collectFonts();
    return fonts.find(f => f.name.toLowerCase() === fontName.toLowerCase()) || null;
}

export async function getFontByFamilyAndStyle(family, style) {
    const fonts = await collectFonts();

    return fonts.find(f =>
        f.name.toLowerCase() === family.toLowerCase() &&
        f.style.toLowerCase() === style.toLowerCase()
    ) || null;
}
