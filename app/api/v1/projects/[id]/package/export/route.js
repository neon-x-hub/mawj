import db from "@/app/lib/providers/db";
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
                outputDir: options.outputDir,
            },
        });

        return Response.json({ jobId, status: 'queued' });
    } catch (err) {
        console.error('Error in /api/v1/project/:id/package/export:', err);
        return Response.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
