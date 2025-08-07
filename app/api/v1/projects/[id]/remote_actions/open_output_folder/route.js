import { exec } from 'child_process';
import path from 'path';
import db from '@/app/lib/providers/db';

// GET /api/projects/abc123/open
export async function GET(_, { params }) {
    const { id } = await params;

    if (!/^[0-9]+_[a-z0-9]+$/.test(id)) {
        return Response.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    const dbInstance = await db.getDB();
    const project = await dbInstance.findById('projects', id);

    if (!project) {
        return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const folderPath = path.resolve(`./data/projects/outputs/${id}`);

    try {
        exec(`powershell -WindowStyle Normal -Command "Start-Process explorer.exe -ArgumentList '${folderPath}'"`);
        return Response.json({ success: true, opened: folderPath });
    } catch (err) {
        console.error(err);
        return Response.json(
            { error: 'Failed to open folder', details: err.message },
            { status: 500 }
        );
    }
}
