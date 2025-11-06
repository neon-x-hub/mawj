export const runtime = 'nodejs';

import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { getFontByName } from '@/app/lib/fonts/manager';

const MIME_TYPES = {
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.ttc': 'font/collection',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

function createContentDisposition(filename) {
    const fallbackName = filename.replace(/[^\x20-\x7E]/g, '_');
    const encodedName = encodeURIComponent(filename);
    return `inline; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
}

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
        },
    });
}

export async function GET(request) {
    const USER_FONT_DIR =
        process.platform === 'win32'
            ? path.join(process.env.USERPROFILE, 'AppData/Local/Microsoft/Windows/Fonts')
            : path.join(process.env.HOME || '', '.local/share/fonts');

    const url = new URL(request.url);
    const fileParam = url.searchParams.get('file');
    const nameParam = url.searchParams.get('name');

    // Determine font source
    let fontPath;

    // Priority 1: file param
    if (fileParam) {
        const file = decodeURIComponent(fileParam);
        if (file.includes('..') || path.isAbsolute(file)) {
            return new Response('Invalid file path', { status: 400 });
        }
        fontPath = path.join(USER_FONT_DIR, file);
    }

    // Priority 2: name param (only if file not provided)
    else if (nameParam) {
        try {
            const font = await getFontByName(decodeURIComponent(nameParam));
            if (!font || !font.fullPath || !font.servable) {
                return new Response('Font not found or not servable', { status: 404 });
            }
            fontPath = font.fullPath;
        } catch (err) {
            console.error('Error getting font by name:', err);
            return new Response('Font lookup error', { status: 500 });
        }
    } else {
        return new Response('Missing file or name parameter', { status: 400 });
    }

    // Validate file existence
    try {
        await fsPromises.access(fontPath);
    } catch {
        return new Response('Not found', { status: 404 });
    }

    // Serve the file
    const ext = path.extname(fontPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stats = await fsPromises.stat(fontPath);

    const stream = await streamFile(fontPath);
    const headers = new Headers({
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': createContentDisposition(path.basename(fontPath)),
        'Access-Control-Allow-Origin': '*',
    });

    return new Response(stream, { status: 200, headers });
}
