import fs from 'fs/promises';
import path from 'path';
import config from '@/app/lib/providers/config';
import { t } from '@/app/i18n';

const DATA_DIR = await config.get('baseFolder') || './data';

export async function POST(request) {
    const { baseFolder } = await request.json();

    if (!baseFolder) {
        return Response.json(
            { error: t('messages.error.baseFolder.missing_parameter') },
            { status: 400 }
        );
    }

    const currentBaseFolder = path.resolve(DATA_DIR);
    const requestedBaseFolder = path.resolve(baseFolder);

    if (currentBaseFolder === requestedBaseFolder) {
        return Response.json({
            success: false,
            message: t('messages.error.baseFolder.already_set')
        });
    }

    try {
        await fs.mkdir(baseFolder, { recursive: true });

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
            message: t('messages.success.baseFolder.updated')
        });
    } catch (error) {
        return Response.json(
            { error: t('messages.error.baseFolder.failed'), details: error.message },
            { status: 500 }
        );
    }
}
