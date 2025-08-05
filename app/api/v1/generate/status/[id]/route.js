// app/api/v1/generate/status/[id]/route.js
import { queue } from '@/app/lib/queue';
export async function GET(request, { params }) {

    const { id } = await params;

    try {
        const job = queue.getJob(id);

        console.log(queue.jobs); // Map(0) {}

        if (!job) {
            return Response.json({ error: 'Job not found' }, { status: 404 });
        }

        return Response.json({
            id: job.id,
            status: job.status,
            progress: job.progress,
            result: job.status === 'done' ? job.result : null,
            error: job.error || null,
            createdAt: job.createdAt
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
