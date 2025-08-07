import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

const USER_FONT_DIR = path.join(process.env.USERPROFILE, 'AppData/Local/Microsoft/Windows/Fonts');
const MIME_TYPES = {
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.ttc': 'font/collection',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

async function streamFile(filePath) {
    const nodeStream = fs.createReadStream(filePath);

    async function* nodeToIterator() {
        for await (const chunk of nodeStream) {
            yield new Uint8Array(chunk);
        }
    }

    return new ReadableStream({
        async pull(controller) {
            const iterator = nodeToIterator();
            for await (const chunk of iterator) {
                controller.enqueue(chunk);
            }
            controller.close();
        }
    });
}

export async function GET(request) {
    const url = new URL(request.url);
    const fileParam = url.searchParams.get('file');
    if (!fileParam) return new Response('Missing file', { status: 400 });

    const file = decodeURIComponent(fileParam);
    if (file.includes('..') || path.isAbsolute(file)) {
        return new Response('Invalid file path', { status: 400 });
    }

    const fontPath = path.join(USER_FONT_DIR, file);
    try {
        await fsPromises.access(fontPath);
    } catch {
        return new Response('Not found', { status: 404 });
    }

    const ext = path.extname(file).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stats = await fsPromises.stat(fontPath);

    const stream = await streamFile(fontPath);
    const headers = new Headers({
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': `inline; filename="${path.basename(fontPath)}"`,
    });

    return new Response(stream, { status: 200, headers });
}
