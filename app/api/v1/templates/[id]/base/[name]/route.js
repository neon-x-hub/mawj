// app/api/v1/templates/[id]/base/[name]/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import config from '@/app/lib/providers/config';

const DATA_DIR = await config.get('baseFolder') || './data';

export async function GET(_, { params }) {
    const { id, name } = await params;

    try {

        const filePath = path.join(DATA_DIR, 'templates', id, 'base_layers', name);


        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }


        const fileBuffer = await fs.readFile(filePath);


        const ext = path.extname(name).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.webp') contentType = 'image/webp';


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
