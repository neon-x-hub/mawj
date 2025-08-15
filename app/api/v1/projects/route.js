import db from "@/app/lib/providers/db";
import { t } from "@/app/i18n";

export async function GET(request) {
    const dbInstance = await db.getDB();

    // Get search params from URL
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Convert string values to proper types
    const filters = {};
    for (const [key, value] of Object.entries(query)) {
        // Handle boolean values
        if (value === 'true') filters[key] = true;
        else if (value === 'false') filters[key] = false;
        // Handle numbers
        else if (!isNaN(value) && value.trim() !== '') filters[key] = Number(value);
        // Handle arrays (comma-separated)
        else if (value.includes(',')) filters[key] = value.split(',');
        // Handle project type enum (card/video/booklet)
        else if (key === 'type' && ['card', 'video', 'booklet'].includes(value)) {
            filters[key] = value;
        }
        // Default to string
        else filters[key] = value;
    }

    try {
        const projects = await dbInstance.find('projects', filters);
        return Response.json({
            data: projects,
            meta: {
            }
        });
    } catch (error) {
        return Response.json(
            { error: t('messages.error.project.listing.failed') },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const dbInstance = await db.getDB();
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.type) {
        return Response.json(
            { error: t('messages.error.project.addition.name_and_type_requred') },
            { status: 400 }
        );
    }

    try {
        // Add default values
        const projectData = {
            ...data,
            description: data.description || '',
            folders: data.folders || [],
            tempplate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const newProject = await dbInstance.create('projects', projectData);
        return Response.json(newProject, { status: 201 });
    } catch (error) {
        return Response.json(
            { error: t('messages.error.project.addition.failed') },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
