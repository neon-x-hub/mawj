import db from "@/app/lib/providers/db";
import fs from 'fs';
import path from "path";
import config from "@/app/lib/providers/config";
import { generateCardPreview } from '@/app/lib/helpers/preview/GeneratePreview';
import { t } from "@/app/i18n";

const DATA_DIR = await config.get('baseFolder') || './data';

// GET /api/templates/:id
export async function GET(_, { params }) {
    const dbInstance = await db.getDB();
    const { id } = await params;

    try {
        const template = await dbInstance.findById('templates', id);
        if (!template) {
            return Response.json(
                { error: t('messages.error.template.single.not_found') },
                { status: 404 }
            );
        }
        return Response.json(template);
    } catch (error) {
        return Response.json(
            { error: t('messages.error.template.listing.failed') },
            { status: 500 }
        );
    }
}

// PUT /api/templates/:id
export async function PUT(request, { params }) {
    const dbInstance = await db.getDB();
    const updates = await request.json();
    const { id } = await params;

    try {
        if (updates.name && updates.name.trim().length < 2) {
            return Response.json(
                { error: t('messages.error.template.update.name_must_be_at_least_2_characters') },
                { status: 400 }
            );
        }

        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.baseLayers;

        const updatedTemplate = await dbInstance.update('templates', id, updateData);
        if (!updatedTemplate) {
            return Response.json(
                { error: t('messages.error.template.single.not_found') },
                { status: 404 }
            );
        }

        Promise.resolve().then(() => generatePreview(updatedTemplate));

        return Response.json(updatedTemplate);
    } catch (error) {
        return Response.json(
            { error: t('messages.error.template.update.failed') },
            { status: 500 }
        );
    }
}

// DELETE /api/templates/:id
export async function DELETE(_, { params }) {
    const dbInstance = await db.getDB();
    const { id } = await params;

    try {
        const template = await dbInstance.findById('templates', id);
        if (!template) {
            return Response.json(
                { error: t('messages.error.template.single.not_found') },
                { status: 404 }
            );
        }

        const projects = await dbInstance.find('projects', { 'template': id });
        if (projects.length > 0) {
            await dbInstance.bulkUpdate('projects', projects.map(project => ({
                id: project.id,
                data: { ...project, template: null }
            })));
        }

        await dbInstance.delete('templates', id);

        fs.rmSync(path.join(DATA_DIR, 'templates', id), { recursive: true });

        return Response.json({
            success: true,
            deletedId: id
        });
    } catch (error) {
        return Response.json(
            { error: t('messages.error.template.deletion.failed') },
            { status: 500 }
        );
    }
}
