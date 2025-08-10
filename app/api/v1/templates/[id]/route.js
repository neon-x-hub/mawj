import db from "@/app/lib/providers/db";
import fs from 'fs'
import path from "path";
import config from "@/app/lib/providers/config";

const DATA_DIR = await config.get('baseFolder') || './data';

// GET /api/templates/:id
export async function GET(_, { params }) {
    const dbInstance = await db.getDB();

    const { id } = await params;

    try {
        const template = await dbInstance.findById('templates', id);
        if (!template) {
            return Response.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }
        return Response.json(template);
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch template' },
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
                { error: 'Template name must be at least 2 characters' },
                { status: 400 }
            );
        }

        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Protect immutable fields
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.baseLayers; // Should use upload endpoint

        const updatedTemplate = await dbInstance.update('templates', id, updateData);
        if (!updatedTemplate) {
            return Response.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }
        return Response.json(updatedTemplate);
    } catch (error) {
        return Response.json(
            { error: 'Failed to update template' },
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
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Check if template is in use
        const projects = await dbInstance.find('projects', {
            'template': id
        });
        if (projects.length > 0) {
            const updates = await dbInstance.bulkUpdate('projects', projects.map(project => ({
                id: project.id,
                data: {
                    ...project,
                    template: null
                }
            })))
        }

        await dbInstance.delete('templates', id);

        fs.rmSync(path.join(DATA_DIR, 'templates', id), { recursive: true });

        return Response.json({
            success: true,
            deletedId: params.id
        });
    } catch (error) {
        return Response.json(
            { error: 'Failed to delete template' },
            { status: 500 }
        );
    }
}
