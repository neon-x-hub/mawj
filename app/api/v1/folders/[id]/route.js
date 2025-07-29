import db from "@/app/lib/providers/db";

export async function PUT(request, { params }) {
    const dbInstance = await db.getDB();

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

    try {
        const id = params.id;

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

        // Check if folder has projects (optional business rule)
        if (folder.projects?.length > 0) {
            return Response.json(
                {
                    error: 'Cannot delete folder with projects',
                    projectCount: folder.projects.length,
                    suggestion: 'Remove all projects first or use force=true parameter to override'
                },
                { status: 409 }
            );
        }

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
