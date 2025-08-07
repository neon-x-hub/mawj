import fs from 'fs';
import path from 'path';
import db from "@/app/lib/providers/db";
import { generatePreview } from '@/app/lib/helpers/preview/GeneratePreview';
import config from '@/app/lib/providers/config';
const PREVIEW_NAME = 'preview.jpg';

export async function GET(request, { params }) {
    const dbInstance = await db.getDB();
    const { id } = await params;

    const template = await dbInstance.findById('templates', id);
    if (!template) return new Response('Template not found', { status: 404 });

    const previewDir = path.resolve(`${await config.get('baseFolder') || './data'}/templates/${id}/previews`);
    const previewPath = path.join(previewDir, PREVIEW_NAME);

    // Ensure preview exists (render it if needed)
    if (!fs.existsSync(previewPath)) {
        if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir, { recursive: true });
        }

        await generatePreview(template);
    }

    // Serve the preview image
    const stream = fs.createReadStream(previewPath);
    return new Response(stream, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
        }
    });
}
