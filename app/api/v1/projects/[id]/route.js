import fs from "fs/promises";
import db from "@/app/lib/providers/db";
import config from "@/app/lib/providers/config";
import { t } from '@/app/i18n';

// GET /api/projects/abc123
export async function GET(_, { params }) {
    const { id } = await params;
    const dbInstance = await db.getDB();
    try {
        const project = await dbInstance.findById('projects', id);
        if (!project) {
            return Response.json({ error: t('messages.error.project.listing.not_found') }, { status: 404 });
        }
        return Response.json(project);
    } catch (error) {
        return Response.json(
            { error: t('messages.error.project.listing.failed') },
            { status: 500 }
        );
    }
}

// PUT /api/projects/abc123
export async function PUT(request, { params }) {
    const dbInstance = await db.getDB();
    const { id } = await params;

    try {
        const updates = await request.json();

        if (!id) {
            return Response.json(
                { error: t('messages.error.project.update.id_required') },
                { status: 400 }
            );
        }

        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        delete updateData.id;

        const updatedProject = await dbInstance.update('projects', id, updateData);

        if (!updatedProject) {
            return Response.json(
                { error: t('messages.error.project.listing.not_found') },
                { status: 404 }
            );
        }

        return Response.json(updatedProject);
    } catch (error) {
        console.error('Update error:', error);
        return Response.json(
            {
                error: t('messages.error.project.update.failed'),
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/abc123
export async function DELETE(_, { params }) {
    const dbInstance = await db.getDB();
    const { id } = await params;

    try {
        if (!id) {
            return Response.json(
                { error: t('messages.error.project.deletion.id_required') },
                { status: 400 }
            );
        }

        const project = await dbInstance.findById('projects', id);
        if (!project) {
            return Response.json(
                { error: t('messages.error.project.deletion.not_found') },
                { status: 404 }
            );
        }

        await dbInstance.delete('projects', id);

        const baseFolder = await config.get('baseFolder') || './data';
        const outputsFolder = `${baseFolder}/projects/outputs/${id}`;
        const datarowsFolder = `${baseFolder}/datarows/${id}`;
        const projectPrivateFolder = `${baseFolder}/projects/${id}`;

        try {
            if (await fs.stat(outputsFolder).catch(() => false)) {
                await fs.rm(outputsFolder, { recursive: true, force: true });
            }
            if (await fs.stat(datarowsFolder).catch(() => false)) {
                await fs.rm(datarowsFolder, { recursive: true, force: true });
            }
            if (await fs.stat(projectPrivateFolder).catch(() => false)) {
                await fs.rm(projectPrivateFolder, { recursive: true, force: true });
            }
        } catch (error) {
            console.warn('Cleanup error:', error);
        }

        return Response.json({
            success: true,
            deletedId: id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return Response.json(
            {
                error: t('messages.error.project.deletion.failed'),
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
