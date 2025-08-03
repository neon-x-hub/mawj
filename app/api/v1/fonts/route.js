// app/api/v1/fonts/route.js
import fs from 'fs';
import path from 'path';
import * as fontkit from 'fontkit';

const USER_FONT_DIR = path.join(process.env.USERPROFILE, 'AppData/Local/Microsoft/Windows/Fonts');

// ✅ Scan the AppData folder for .ttf/.otf/.ttc
function scanUserFonts() {
    const results = [];
    if (!fs.existsSync(USER_FONT_DIR)) return results;

    fs.readdirSync(USER_FONT_DIR).forEach(file => {
        if (/\.(ttf|otf|ttc)$/i.test(file)) {
            results.push({ file, dir: USER_FONT_DIR });
        }
    });

    return results;
}

// ✅ Extract font family name from file
function getFamilyFromFile(filePath) {
    try {
        const font = fontkit.openSync(filePath);
        return font.familyName?.trim() || null;
    } catch {
        return null;
    }
}

// ✅ Collect fonts and deduplicate by family name
async function collectFonts() {
    const fontMap = new Map();
    const files = scanUserFonts();

    files.forEach(({ file, dir }) => {
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
    });

    return Array.from(fontMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// ✅ API Handler
export async function GET() {
    try {
        const fonts = await collectFonts();
        return Response.json({
            success: true,
            meta: { count: fonts.length },
            data: fonts
        });
    } catch (err) {
        console.error('Font listing failed:', err);
        return Response.json({ success: false, error: 'Cannot list fonts' }, { status: 500 });
    }
}
