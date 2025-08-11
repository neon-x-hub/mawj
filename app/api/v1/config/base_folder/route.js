import fs from 'fs/promises';
import path from 'path';
import config from '@/app/lib/providers/config';

const DATA_DIR = await config.get('baseFolder') || './data';

export async function POST(request) {
    const { baseFolder } = await request.json();

    if (!baseFolder) {
        return Response.json({ error: 'Missing baseFolder parameter' }, { status: 400 });
    }

    const currentBaseFolder = path.resolve(DATA_DIR);
    const requestedBaseFolder = path.resolve(baseFolder);

    if (currentBaseFolder === requestedBaseFolder) {
        return Response.json({
            success: false,
            message: 'The base folder is already set to this path.'
        });
    }


    try {
        await fs.mkdir(baseFolder, { recursive: true });

        // ✅ Recursively copy data
        await fs.cp(DATA_DIR, baseFolder, { recursive: true, force: true });

        // Delete old data
        await fs.rm(DATA_DIR, { recursive: true, force: true });

        // Update config
        await config.set('baseFolder', baseFolder);

        // Schedule restart after request completes
        setTimeout(() => {
            process.exit(0);
        }, 500);

        return Response.json({
            success: true,
            message: 'Base folder updated. Restarting server...'
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
