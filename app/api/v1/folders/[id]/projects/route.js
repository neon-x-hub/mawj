import db from "@/app/lib/providers/db";

export async function GET(req, { params }) {
    const dbInstance = await db.getDB();
    const id = await params.id;

    try {
        // Get folder by ID
        const folder = await dbInstance.findById('folders', id);
        if (!folder) {
            return Response.json({ error: 'Folder not found' }, { status: 404 });
        }

        const { projects } = folder;
        if (!projects || projects.length === 0) {
            return Response.json({ data: [] }, { status: 200 });
        }

        // Fetch all projects referenced in the folder
        const projectPromises = projects.map((projectId) =>
            dbInstance.findById('projects', projectId)
        );

        const projectsData = await Promise.all(projectPromises);
        return Response.json({ data: projectsData }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch folder projects:', error);
        return Response.json(
            {
                error: 'Failed to fetch folder projects',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}
