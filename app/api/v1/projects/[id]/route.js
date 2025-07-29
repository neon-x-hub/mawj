import db from "@/app/lib/providers/db";

// GET /api/projects/abc123
export async function GET(_, { params }) {
    await params;
    const dbInstance = await db.getDB();
    try {
        const project = await dbInstance.findById('projects', params.id);
        if (!project) {
            return Response.json({ error: "Project not found" }, { status: 404 });
        }
        return Response.json(project);
    } catch (error) {
        return Response.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        );
    }
}

// PUT /api/projects/abc123
export async function PUT(request, { params }) {
    const dbInstance = await db.getDB();

    try {
        const updates = await request.json();

        // Validate ID from route params
        if (!params.id) {
            return Response.json(
                { error: 'Project ID is required in URL' },
                { status: 400 }
            );
        }

        // Add system-managed fields
        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Prevent ID change through payload
        delete updateData.id;

        const updatedProject = await dbInstance.update('projects', params.id, updateData);

        if (!updatedProject) {
            return Response.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return Response.json(updatedProject);
    } catch (error) {
        console.error('Update error:', error);
        return Response.json(
            {
                error: 'Failed to update project',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/abc123
export async function DELETE(_, { params }) {
    const dbInstance = await db.getDB();

    try {
        // Validate route param ID
        if (!params.id) {
            return Response.json(
                { error: 'Project ID is required in URL' },
                { status: 400 }
            );
        }

        // Optional: Check if project exists first
        const project = await dbInstance.findById('projects', params.id);
        if (!project) {
            return Response.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const deleted = await dbInstance.delete('projects', params.id);
        return Response.json({
            success: true,
            deletedId: params.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Deletion error:', error);
        return Response.json(
            {
                error: 'Failed to delete project',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
