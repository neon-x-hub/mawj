// app/api/v1/templates/[id]/base/[name]/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const DATA_DIR = process.env.DATA_DIR || './data';

export async function GET(_, { params }) {
    const { id, name } = await params;

    try {
        // ✅ Construct full file path
        const filePath = path.join(DATA_DIR, 'templates', id, 'base_layers', name);

        // ✅ Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // ✅ Read file
        const fileBuffer = await fs.readFile(filePath);

        // ✅ Determine Content-Type by extension
        const ext = path.extname(name).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.webp') contentType = 'image/webp';

        // ✅ Return response with proper headers
        return new Response(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${name}"`,
                'Cache-Control': 'public, max-age=31536000'
            }
        });
    } catch (err) {
        console.error('❌ File Serve Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
