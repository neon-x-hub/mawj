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
    const id = params.id; // ✅ project ID
    const body = await req.json();
    const { folders } = body; // ✅ array of folder IDs

    const project = await dbInstance.findById('projects', id);
    if (!project) {
        return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    try {
        const allFolders = await dbInstance.find('folders');

        // ✅ Update folders: add/remove project ID as needed
        for (const folder of allFolders) {

            if (!Array.isArray(folder.projects)) folder.projects = [];

            if (folders.includes(folder.id)) {
                // Ensure project is in folder
                if (!folder.projects.includes(id)) folder.projects.push(id);
            } else {
                // Remove project if exists
                folder.projects = folder.projects.filter(pid => pid !== id);
            }

            await dbInstance.update('folders', folder.id, folder);
            await dbInstance.update('projects', id, {
                folders: project.folders ? [...project.folders, folder.id] : [folder.id]
            }); // Update project to trigger reactivity
        }

        return Response.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('❌ Failed to update project folders:', error);
        return Response.json(
            { error: 'Failed to update project folders', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: 500 }
        );
    }
}
