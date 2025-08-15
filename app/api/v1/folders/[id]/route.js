import db from "@/app/lib/providers/db";
import { t } from "@/app/i18n";

export async function PUT(request, { params }) {
    const dbInstance = await db.getDB();
    await params;

    try {
        const { id: payloadId, ...updates } = await request.json();
        const routeId = params.id;

        // Validate route parameter ID
        if (!routeId) {
            return Response.json(
                { error: t('messages.error.folder.update.id_required') },
                { status: 400 }
            );
        }

        // Reject if IDs in URL and body don't match
        if (payloadId && payloadId !== routeId) {
            return Response.json(
                { error: t('messages.error.folder.update.id_mismatch') },
                { status: 400 }
            );
        }

        // Validate updates
        if (updates.name && (typeof updates.name !== 'string' || updates.name.trim().length < 2)) {
            return Response.json(
                { error: t('messages.error.folder.update.name_must_be_at_least_2_characters') },
                { status: 400 }
            );
        }

        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        delete updateData.createdAt;
        delete updateData.id;

        const updatedFolder = await dbInstance.update('folders', routeId, updateData);

        if (!updatedFolder) {
            return Response.json(
                { error: t('messages.error.folder.listing.not_found') },
                { status: 404 }
            );
        }

        return Response.json(updatedFolder);

    } catch (error) {
        console.error('Failed to update folder:', error);
        return Response.json(
            {
                error: t('messages.error.folder.update.failed'),
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
                { error: t('messages.error.folder.deletion.id_required') },
                { status: 400 }
            );
        }

        const folder = await dbInstance.findById('folders', id);
        if (!folder) {
            return Response.json(
                { error: t('messages.error.folder.deletion.not_found') },
                { status: 404 }
            );
        }

        const projectIds = folder.projects || [];
        if (projectIds.length > 0) {
            const projects = await dbInstance.bulkFindByIds('projects', projectIds);

            if (projects.length > 0) {
                const updatedProjects = projects.map(project => ({
                    ...project,
                    folders: (project.folders || []).filter(folderId => folderId !== id)
                }));

                await dbInstance.bulkUpdate('projects', updatedProjects);
            }
        }

        await dbInstance.delete('folders', id);

        return Response.json({
            success: true,
            deletedId: id,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Failed to delete folder:', error);
        return Response.json(
            {
                error: t('messages.error.folder.deletion.failed'),
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
