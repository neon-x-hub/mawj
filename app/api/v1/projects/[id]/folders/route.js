import db from "@/app/lib/providers/db";

export async function GET(req, { params }) {
    const dbInstance = await db.getDB();
    await params;
    const id = params.id;

    try {
        // ✅ Fetch all folders
        const allFolders = await dbInstance.find('folders');

        // ✅ Filter folders that contain this project ID in their projects array
        const matchingFolders = Object.values(allFolders).filter((folder) =>
            Array.isArray(folder.projects) && folder.projects.includes(id)
        );

        return Response.json({ data: matchingFolders }, { status: 200 });

    } catch (error) {
        console.error('❌ Failed to fetch folders for project:', error);
        return Response.json(
            {
                error: 'Failed to fetch folders for project',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

export async function PUT(req, { params }) {
    const dbInstance = await db.getDB();
    await params;
    const id = params.id;
    const { folders: targetFolderIds } = await req.json(); // ✅ array of folder IDs

    try {
        // ✅ Check project existence
        const project = await dbInstance.findById('projects', id);
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        // ✅ Fetch all folders (once)
        const allFolders = await dbInstance.find('folders');

        // ✅ Prepare bulk updates
        const updates = allFolders.map(folder => {
            const updatedProjects = Array.isArray(folder.projects) ? [...folder.projects] : [];

            if (targetFolderIds.includes(folder.id)) {
                if (!updatedProjects.includes(id)) updatedProjects.push(id);
            } else {
                // Remove this project ID if present
                const idx = updatedProjects.indexOf(id);
                if (idx !== -1) updatedProjects.splice(idx, 1);
            }

            return { id: folder.id, data: { ...folder, projects: updatedProjects } };
        });

        // ✅ Bulk update all folders at once
        await dbInstance.bulkUpdate('folders', updates);

        // ✅ Update the project with its new folder associations
        await dbInstance.update('projects', id, {
            ...project,
            folders: targetFolderIds
        });

        return Response.json({ success: true, updatedFolders: targetFolderIds }, { status: 200 });

    } catch (error) {
        console.error('❌ Failed to update project folders:', error);
        return Response.json(
            {
                error: 'Failed to update project folders',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}
