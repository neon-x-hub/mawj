// Generate POST endpoint for the `/api/v1/generate` route
// This endpoint is used to generate new project outputs from a template and data

import { enqueueRenderJob, queue } from '@/app/lib/queue';
import db from "@/app/lib/providers/db";
import datarows from "@/app/lib/providers/datarows";

export async function POST(request) {
    try {
        const data = await request.json();

        const dbInstance = await db.getDB();

        // 1. Check the project
        const project = await dbInstance.findById('projects', data.project);
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        // 2. Check the template
        const template = await dbInstance.findById('templates', project.template);
        if (!template) {
            return Response.json({ error: 'Template not found' }, { status: 404 });
        }

        const dataRowsInstance = await datarows.getDataProvider();

        // 3. Create filters based on the options
        let dataRows = [];
        const opts = data.options || { range: 'all', regenerate_done: false, format: 'png' };
        if (opts.range === 'all') {
            // find all data rows for this project
            dataRows = await dataRowsInstance.find(project.id, opts.regenerate_done ? {} : { status: false });
        } else if (Array.isArray(opts.range)) {
            // find specific data rows by IDs
            dataRows = await dataRowsInstance.bulkFindByIds(opts.range);
        } else {
            return Response.json({ error: 'Invalid range option' }, { status: 400 });
        }

        if (dataRows.length === 0) {
            return Response.json({ error: 'No data rows found' }, { status: 404 });
        }

        // 4. Add to queue
        const jobData = {
            project,
            template,
            rows: dataRows,
            options: opts,
        };

        // 5. Add to queue
        const jobId = enqueueRenderJob(jobData);

        return Response.json({ jobId, status: 'queued' });

    } catch (err) {
        console.error('Error in /api/v1/generate:', err);
        return Response.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
