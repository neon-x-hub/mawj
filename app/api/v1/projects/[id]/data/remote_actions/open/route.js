import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import config from '@/app/lib/providers/config';
import db from '@/app/lib/providers/db';
import { getDefaultApp } from '@/app/lib/plateform/common';

const BASE_DATA_DIR = (await config.get('baseFolder')) || './data';

const MEDIA_EXTENSIONS_BY_TYPE = {
    card: ['.jpg', '.png', '.webp'],
    video: ['.mp4', '.avi', '.mov', '.mkv'],
};

/**
 * Opens a file with the default associated Windows app (Photos, Videos, etc.)
 * using the Windows 'start' command via cmd.
 * @param {string} filePath Absolute or relative file path.
 * @returns {boolean} True if the file exists and open command was triggered, else false.
 */
function openWithDefaultApp(filePath) {
    try {
        const absolutePath = path.resolve(filePath);

        if (!fs.existsSync(absolutePath)) {
            console.error(`File not found: ${absolutePath}`);
            return false;
        }
        const { command, args } = getDefaultApp();

        spawn(command, [...args, absolutePath], {
            detached: true,
            stdio: 'ignore',
            shell: true,
        }).unref();

        return true;
    } catch (error) {
        console.error('Failed to open file:', error);
        return false;
    }
}

export async function POST(request, { params }) {
    const { id: mainProjectId } = await params;
    if (!/^[0-9]+_[a-zA-Z0-9]+$/.test(mainProjectId)) {
        return Response.json(
            { error: 'Invalid main project ID format in URL parameters' },
            { status: 400 }
        );
    }

    const requestBody = await request.json();
    const targetIds = requestBody.ids;
    if (!Array.isArray(targetIds)) {
        return Response.json(
            { error: 'Expected an array of IDs in the request body' },
            { status: 400 }
        );
    }

    const database = await db.getDB();
    const mainProject = await database.findById('projects', mainProjectId);

    if (!mainProject) {
        return Response.json({ error: 'Main project not found' }, { status: 404 });
    }

    const projectOutputDir = path.resolve(BASE_DATA_DIR, 'projects', 'outputs', mainProjectId);
    const results = [];

    for (const targetId of targetIds) {
        if (!/^[0-9]+_[a-zA-Z0-9]+$/.test(targetId)) {
            results.push({ id: targetId, error: 'Invalid target ID format' });
            continue;
        }

        const mediaType = mainProject.type;

        if (mediaType in MEDIA_EXTENSIONS_BY_TYPE) {
            const extensionsToTry = MEDIA_EXTENSIONS_BY_TYPE[mediaType];
            let fileOpened = false;

            for (const ext of extensionsToTry) {
                const candidateFilePath = path.join(projectOutputDir, targetId + ext);
                if (fs.existsSync(candidateFilePath)) {
                    const opened = openWithDefaultApp(candidateFilePath);
                    if (opened) {
                        results.push({ id: targetId, openedFile: candidateFilePath });
                        fileOpened = true;
                        break;
                    } else {
                        results.push({ id: targetId, error: 'Failed to open file' });
                        fileOpened = true;
                        break;
                    }
                }
            }

            if (!fileOpened) {
                results.push({
                    id: targetId,
                    error: `No matching file found for media type "${mediaType}" in project output folder`,
                });
            }
        } else {
            results.push({
                id: targetId,
                error: `Unsupported media type "${mediaType}" for main project`,
            });
        }
    }

    return Response.json({ results });
}
