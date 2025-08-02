import db from "@/app/lib/providers/db";

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

        const updatedTemplate = await dbInstance.update('templates', params.id, updateData);
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

    try {
        const template = await dbInstance.findById('templates', params.id);
        if (!template) {
            return Response.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Check if template is in use
        const projects = await dbInstance.find('projects', {
            'defaultTemplate': params.id
        });
        if (projects.length > 0) {
            return Response.json(
                {
                    error: 'Template is in use by projects',
                    projectCount: projects.length
                },
                { status: 409 }
            );
        }

        await dbInstance.delete('templates', params.id);
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
