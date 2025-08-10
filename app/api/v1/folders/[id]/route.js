import db from "@/app/lib/providers/db";

export async function PUT(request, { params }) {
    const dbInstance = await db.getDB();
    await params;

    try {
        const { id: payloadId, ...updates } = await request.json();
        const routeId = params.id;

        // Validate route parameter ID
        if (!routeId) {
            return Response.json(
                { error: 'Folder ID is required in URL' },
                { status: 400 }
            );
        }

        // Reject if IDs in URL and body don't match
        if (payloadId && payloadId !== routeId) {
            return Response.json(
                { error: 'Folder ID in body does not match URL' },
                { status: 400 }
            );
        }

        // Validate updates
        if (updates.name && (typeof updates.name !== 'string' || updates.name.trim().length < 2)) {
            return Response.json(
                { error: 'Folder name must be at least 2 characters' },
                { status: 400 }
            );
        }

        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Prevent overwriting critical fields
        delete updateData.createdAt;
        delete updateData.id;

        const updatedFolder = await dbInstance.update('folders', routeId, updateData);

        if (!updatedFolder) {
            return Response.json(
                { error: 'Folder not found' },
                { status: 404 }
            );
        }

        return Response.json(updatedFolder);

    } catch (error) {
        console.error('Failed to update folder:', error);
        return Response.json(
            {
                error: 'Failed to update folder',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function DELETE(_, { params }) {
    const dbInstance = await db.getDB();
    const { id } = await params;

    try {
        if (!id) {
            return Response.json(
                { error: 'Folder ID is required in URL' },
                { status: 400 }
            );
        }

        // First check if folder exists
        const folder = await dbInstance.findById('folders', id);
        if (!folder) {
            return Response.json(
                { error: 'Folder not found' },
                { status: 404 }
            );
        }

        // Check if folder has projects
        const projectIds = folder.projects || [];
        if (projectIds.length > 0) {
            // Bulk find projects by their IDs
            const projects = await dbInstance.bulkFindByIds('projects', projectIds);

            if (projects.length > 0) {
                // Update each project by removing this folder id from their folders array
                const updatedProjects = projects.map(project => ({
                    ...project,
                    folders: (project.folders || []).filter(folderId => folderId !== id)
                }));

                // Bulk update projects
                await dbInstance.bulkUpdate('projects', updatedProjects);
            }
        }

        // Finally delete the folder
        const deleted = await dbInstance.delete('folders', id);
        return Response.json({
            success: true,
            deletedId: id,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Failed to delete folder:', error);
        return Response.json(
            {
                error: 'Failed to delete folder',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
