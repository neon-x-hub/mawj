import db from "@/app/lib/providers/db";

export async function GET(request) {
    const dbInstance = await db.getDB();
    const { searchParams } = new URL(request.url);

    try {
        // Convert search params to filters with enhanced parsing
        const filters = {
            name: searchParams.has('name') ? searchParams.get('name') : undefined,
            description: searchParams.has('description') ? searchParams.get('description') : undefined,
            hasProjects: searchParams.get('hasProjects') === 'true' ? true : undefined,
            minProjects: searchParams.has('minProjects')
                ? parseInt(searchParams.get('minProjects'))
                : undefined,
            maxProjects: searchParams.has('maxProjects')
                ? parseInt(searchParams.get('maxProjects'))
                : undefined,
            projectIds: searchParams.get('projectIds')?.split(',')
        };

        // Clean undefined filters
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== undefined)
        );

        let folders = await dbInstance.find('folders', cleanFilters);

        // Apply advanced filtering that can't be done in simple DB query
        if (filters.hasProjects !== undefined) {
            folders = folders.filter(folder =>
                filters.hasProjects ? folder.projects?.length > 0 : folder.projects?.length === 0
            );
        }

        if (filters.minProjects !== undefined) {
            folders = folders.filter(folder =>
                folder.projects?.length >= filters.minProjects
            );
        }

        if (filters.maxProjects !== undefined) {
            folders = folders.filter(folder =>
                folder.projects?.length <= filters.maxProjects
            );
        }


        return Response.json({
            data: folders,
            meta: {
                count: folders.length,
                totalProjects: folders.reduce((sum, folder) => sum + (folder.projects?.length || 0), 0)
            }
        });

    } catch (error) {
        console.error('Failed to fetch folders:', error);
        return Response.json(
            {
                error: 'Failed to fetch folders',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const dbInstance = await db.getDB();

    try {
        const data = await request.json();

        // Enhanced validation
        if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
            return Response.json(
                { error: 'Folder name must be at least 2 characters' },
                { status: 400 }
            );
        }

        const folderData = {
            name: data.name.trim(),
            description: data.description?.trim() || '',
            projects: data.projects || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const newFolder = await dbInstance.create('folders', folderData);

        return Response.json(newFolder, {
            status: 201,
            headers: {
                'Location': `/api/folders?id=${newFolder.id}`
            }
        });

    } catch (error) {
        console.error('Failed to create folder:', error);
        return Response.json(
            {
                error: 'Failed to create folder',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
