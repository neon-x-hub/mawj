import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import db from '@/app/lib/providers/db';
import generateId from '@/app/lib/id/generate';
import config from '@/app/lib/providers/config';

const DATA_DIR = await config.get('baseFolder') || './data';

export async function POST(request, { params }) {
    const dbInstance = await db.getDB();
    const { id } = await params;

    try {

        const formData = await request.formData();
        const files = formData.getAll('files');
        if (!files || files.length === 0) {
            return Response.json({ error: 'No files uploaded' }, { status: 400 });
        }


        const template = await dbInstance.findById('templates', id);
        if (!template) {
            return Response.json({ error: 'Template not found' }, { status: 404 });
        }


        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return Response.json(
                    { error: `Invalid file type: ${file.name}` },
                    { status: 400 }
                );
            }
        }


        const uploadDir = path.join(DATA_DIR, 'templates', id, 'base_layers');
        await fs.mkdir(uploadDir, { recursive: true });


        const savedLayers = [];
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileId = generateId(8);
            const fileExt = path.extname(file.name) || '.png';
            const filename = `${fileId}${fileExt}`;
            const filePath = path.join(uploadDir, filename);

            // Save file
            await fs.writeFile(filePath, buffer);


            const { width, height } = await sharp(buffer).metadata();

            savedLayers.push({
                name: filename,
                width,
                height
            });
        }


        let updatedBaseLayers;
        if (template.type === 'booklet') {

            // Will be modified soon...
            updatedBaseLayers = [...(template.baseLayers || []), ...savedLayers];
        } else {

            updatedBaseLayers = [savedLayers[savedLayers.length - 1]];
        }

        const updatedTemplate = await dbInstance.update('templates', id, {
            baseLayers: updatedBaseLayers,
        });


        //  Delete every file in /data/templates/{id}/base_layers if it's not in updatedBaseLayers
        const filesToDelete = await fs.readdir(uploadDir);
        for (const file of filesToDelete) {
            if (!updatedBaseLayers.find(layer => layer.name === file)) {
                await fs.unlink(path.join(uploadDir, file));
            }
        }




        return Response.json({
            success: true,
            addedLayers: savedLayers.length,
            templateId: id,
            baseLayers: updatedTemplate.baseLayers
        });
    } catch (error) {
        console.error('❌ Upload Error:', error);
        return Response.json({ error: 'File upload failed' }, { status: 500 });
    }
}
