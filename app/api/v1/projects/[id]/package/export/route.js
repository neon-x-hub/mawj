import fs from 'fs';
import db from "@/app/lib/providers/db";
import { createProjectBundle } from "@/app/lib/package/export/exportProject";

export async function GET(_, { params }) {
    const { id } = await params;
    const dbInstance = await db.getDB();
    let zipPath = null;

    try {
        // Fetch project and template
        const project = await dbInstance.findById("projects", id);
        if (!project) {
            return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
        }

        const template = await dbInstance.findById("templates", project.template);
        if (!template) {
            return new Response(JSON.stringify({ error: "Template not found" }), { status: 404 });
        }

        // Generate the .zip file
        zipPath = await createProjectBundle(project, template);

        // Open a read stream for the zip
        const zipStream = fs.createReadStream(zipPath);

        // Return the zip stream in a Response
        return new Response(zipStream, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${project.id}.mawj.zip"`,
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "Failed to generate bundle",
            details: error.message
        }), { status: 500 });

    } finally {
        if (zipPath) {
            //cleanupBundle(zipPath); // When commented works fine
        }
    }
}


import { enqueueExportJob } from '@/app/lib/package/export/enqueue';

export async function POST(request, { params }) {
    try {
        const { id: projectId } = await params;
        const options = await request.json();

        const dbInstance = await db.getDB();

        // 1. Fetch project
        const project = await dbInstance.findById('projects', projectId);
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        // 2. Fetch template
        const template = await dbInstance.findById('templates', project.template);
        if (!template) {
            return Response.json({ error: 'Template not found' }, { status: 404 });
        }

        // 3. Queue export job
        const jobId = enqueueExportJob({
            project,
            template,
            options: {
                include: options.include ?? {
                    metadata: true,
                    template: true,
                    baseLayers: true,
                    datarows: true,
                    outputs: true,
                    fonts: true,
                },
                outputDir: options.outputDir, // Optional output path
            },
        });

        return Response.json({ jobId, status: 'queued' });
    } catch (err) {
        console.error('Error in /api/v1/project/:id/package/export:', err);
        return Response.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
