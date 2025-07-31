import db from "@/app/lib/providers/db";


export async function GET(params) {
    const dbInstance = await db.getDB();
    await params;
    const { id } = params;

    // Get Folder, then folder.projects, then for each project get it from "projects" collection
    try {
        if (!id) {
            return Response.json(
                { error: 'Folder ID is required in URL' },
                { status: 400 }
            );
        }

        const folder = await dbInstance.findById('folders', id);
        if (!folder) {
            return Response.json(
                { error: 'Folder not found' },
                { status: 404 }
            );
        }
        const { projects } = folder;
        if (!projects || projects.length === 0) {
            return Response.json(
                { data: [] },
                { status: 200 }
            );
        }
        const projectPromises = projects.map(async (projectId) => {
            const project = await dbInstance.findById('projects', projectId);
            return project;
        });

        const projectsData = await Promise.all(projectPromises);
        return Response.json(
            { data: projectsData },
            { status: 200 }
        );

    } catch (error) {
        console.error('Failed to fetch folder projects:', error);
        return Response.json(
            { error: 'Failed to fetch folder projects', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: 500 }
        );
    }
}
