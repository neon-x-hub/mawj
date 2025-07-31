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
    const { id } = params; // ✅ project ID
    const { folders } = await req.json(); // ✅ array of folder IDs

    try {
        // ✅ Find the project
        const project = await dbInstance.findById('projects', id);
        if (!project) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        // ✅ Fetch all folders
        const allFolders = await dbInstance.find('folders');

        // ✅ Iterate through all folders to update their `projects` lists
        for (const folder of allFolders) {
            if (!Array.isArray(folder.projects)) folder.projects = [];

            if (folders.includes(folder.id)) {
                // ✅ Ensure this project ID is present
                if (!folder.projects.includes(id)) {
                    folder.projects.push(id);
                }
            } else {
                // ✅ Ensure this project ID is removed
                folder.projects = folder.projects.filter(pid => pid !== id);
            }

            // ✅ Persist updated folder
            await dbInstance.update('folders', folder.id, folder);
        }

        // ✅ Update the project object to reflect the final folder associations
        await dbInstance.update('projects', id, {
            ...project,
            folders: folders // ✅ directly set to the new desired state
        });

        return Response.json({ success: true, updatedFolders: folders }, { status: 200 });

    } catch (error) {
        console.error('❌ Failed to update project folders:', error);
        return Response.json(
            {
                error: 'Failed to update project folders',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
