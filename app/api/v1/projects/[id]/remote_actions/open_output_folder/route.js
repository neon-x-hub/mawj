import { spawn } from 'child_process';
import path from 'path';
import db from '@/app/lib/providers/db';
import config from '@/app/lib/providers/config';

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

    const folderPath = path.resolve(`${await config.get('baseFolder') || './data'}/projects/outputs/${id}`);

    console.log('Opening folder:', folderPath);


    try {
        // Use explorer directly
        spawn('explorer.exe', [folderPath], {
            detached: true,
            stdio: 'ignore'
        }).unref();

        return Response.json({ success: true, opened: folderPath });
    } catch (err) {
        console.error(err);
        return Response.json(
            { error: 'Failed to open folder', details: err.message },
            { status: 500 }
        );
    }
}
