import fs from "fs/promises";
import db from "@/app/lib/providers/db";
import config from "@/app/lib/providers/config";

// GET /api/projects/abc123
export async function GET(_, { params }) {
    const { id } = await params;
    const dbInstance = await db.getDB();
    try {
        const project = await dbInstance.findById('projects', id);
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

    const { id } = await params;

    try {
        const updates = await request.json();

        // Validate ID from route params
        if (!id) {
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

        const updatedProject = await dbInstance.update('projects', id, updateData);

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

    const { id } = await params;

    try {
        // Validate route param ID
        if (!id) {
            return Response.json(
                { error: 'Project ID is required in URL' },
                { status: 400 }
            );
        }

        // Optional: Check if project exists first
        const project = await dbInstance.findById('projects', id);
        if (!project) {
            return Response.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const deleted = await dbInstance.delete('projects', id);
        const outputsFolder = `${await config.get('baseFolder') || './data'}/projects/outputs/${id}`;
        const datarowsFolder = `${await config.get('baseFolder') || './data'}/datarows/${id}`;
        const projectPrivateFolder = `${await config.get('baseFolder') || './data'}/projects/${id}`;

        try {
            // Check if the folder exist
            if (await fs.stat(outputsFolder).catch(() => false)) {
                // Folder exists
                await fs.rm(outputsFolder, { recursive: true, force: true });
            }
            // Check if the folder exist
            if (await fs.stat(datarowsFolder).catch(() => false)) {
                await fs.rm(datarowsFolder, { recursive: true, force: true });
            }
            // Check if the folder exist
            if (await fs.stat(projectPrivateFolder).catch(() => false)) {
                await fs.rm(projectPrivateFolder, { recursive: true, force: true });
            }
        } catch (error) {
            console.error('Cleanup error:', error);
            throw error;
        }

        return Response.json({
            success: true,
            deletedId: id,
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
