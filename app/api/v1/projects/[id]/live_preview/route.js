import fs from 'fs';
import path, { format } from 'path';
import db from "@/app/lib/providers/db";
import config from '@/app/lib/providers/config';
import { generateCardPreview, generateVideoPreview } from '@/app/lib/helpers/preview/GeneratePreview';

const PREVIEW_BASENAME = 'temp_preview';

export async function GET(request, { params }) {
    try {
        const dbInstance = await db.getDB();
        const { id: projectId } = await params;

        // 1. Check if project exists
        const project = await dbInstance.findById('projects', projectId);
        if (!project)
            return new Response('Project not found', { status: 404 });

        // 2. Fetch template linked to project
        const templateId = project.template;
        const template = await dbInstance.findById('templates', templateId);
        if (!template)
            return new Response('Template not found', { status: 404 });

        // 3. Locate preview folder
        const baseFolder = await config.get('baseFolder') || './data';
        const previewDir = path.resolve(`${baseFolder}/templates/${templateId}/previews`);

        if (!fs.existsSync(previewDir)) {
            return new Response('Preview not found', { status: 404 });
        }

        // 4. Detect which preview file exists
        const supportedExtensions = ['png', 'jpg', 'jpeg', 'mp4'];
        let previewPath = null;

        for (const ext of supportedExtensions) {
            const fullPath = path.join(previewDir, `${PREVIEW_BASENAME}.${ext}`);
            if (fs.existsSync(fullPath)) {
                previewPath = fullPath;
                break;
            }
        }

        if (!previewPath) {
            return new Response('No preview found', { status: 404 });
        }

        const ext = path.extname(previewPath).toLowerCase();
        const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.mp4': 'video/mp4',
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const stream = fs.createReadStream(previewPath);

        return new Response(stream, {
            headers: {
                'Content-Type': contentType,
            }
        });

    } catch (err) {
        console.error('Error in GET preview:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const input = await request.json();
        const { id: projectId } = await params;

        const renderParams = input.params || {};
        const opts = input.options || {};
        const liveGenOpts = opts.liveGenOpts || {};

        const dbInstance = await db.getDB();

        const project = await dbInstance.findById('projects', projectId);
        if (!project)
            return Response.json({ error: 'Project not found' }, { status: 404 });

        const templateId = project.template;
        const template = await dbInstance.findById('templates', templateId);
        if (!template)
            return Response.json({ error: 'Template not found' }, { status: 404 });

        const baseFolder = await config.get('baseFolder') || './data';
        const previewDir = path.resolve(`${baseFolder}/templates/${templateId}/previews`);

        if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir, { recursive: true });
        }

        let renderer;
        let extension;
        switch (template.type) {
            case 'card':
                renderer = generateCardPreview;
                extension = 'png';
                break;
            case 'video':
                renderer = generateVideoPreview;
                extension = 'mp4';
                break;
            default:
                return Response.json({ error: 'Unsupported template type' }, { status: 400 });
        }

        const previewName = `${PREVIEW_BASENAME}.${extension}`;
        const previewPath = path.join(previewDir, previewName);

        const preparedRow = { id: PREVIEW_BASENAME, data: { ...renderParams } };

        await renderer(project, template, preparedRow, {
            ...opts,
            format: extension,
            outputDir: previewDir,
            outputName: previewName,
            liveGen: true,
            ...liveGenOpts
        });

        return Response.json({
            success: true,
            project: projectId,
            template: templateId,
            preview: previewName,
            path: previewPath
        });

    } catch (err) {
        console.error('Error in POST preview generation:', err);
        return Response.json({
            error: 'Internal Server Error',
            details: err.message
        }, { status: 500 });
    }
}
