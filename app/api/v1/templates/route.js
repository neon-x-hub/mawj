import db from "@/app/lib/providers/db";
import { t } from "@/app/i18n";

// GET /api/templates
export async function GET() {
    const dbInstance = await db.getDB();

    try {
        const templates = await dbInstance.find('templates');
        return Response.json({
            data: templates,
            count: templates.length
        });
    } catch (error) {
        return Response.json(
            { error: t('messages.error.template.listing.failed') },
            { status: 500 }
        );
    }
}

// POST /api/templates
export async function POST(request) {
    const dbInstance = await db.getDB();
    const data = await request.json();

    try {
        if (!data.name || data.name.trim().length < 2) {
            return Response.json(
                { error: t('messages.error.template.addition.name_must_be_at_least_2_characters') },
                { status: 400 }
            );
        }

        const templateData = {
            name: data.name.trim(),
            description: data.description || '',
            type: data.type || 'card',
            baseLayers: [],
            layers: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const newTemplate = await dbInstance.create('templates', templateData);
        return Response.json(newTemplate, { status: 201 });
    } catch (error) {
        return Response.json(
            { error: t('messages.error.template.addition.failed') },
            { status: 500 }
        );
    }
}
