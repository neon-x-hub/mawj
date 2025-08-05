import fs from 'fs';
import path from 'path';

const USER_FONT_DIR = path.join(process.env.USERPROFILE, 'AppData/Local/Microsoft/Windows/Fonts');

const MIME_TYPES = {
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.ttc': 'font/collection',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

export async function GET(req) {
    const url = new URL(req.url);
    let file = url.searchParams.get('file');
    if (!file) return new Response('Missing file', { status: 400 });

    // ✅ Decode URL-encoded filenames
    file = decodeURIComponent(file);

    const fontPath = path.join(USER_FONT_DIR, file);

    if (!fs.existsSync(fontPath)) return new Response('Not found', { status: 404 });

    const ext = path.extname(file).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const stream = fs.createReadStream(fontPath);
    return new Response(stream, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
        }
    });
}
