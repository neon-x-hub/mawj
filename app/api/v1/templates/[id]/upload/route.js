import db from "@/app/lib/providers/db";

// POST /api/templates/:id/upload
export async function POST(request, { params }) {
    const dbInstance = await db.getDB();

    try {
        // Placeholder for actual file processing
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (!files || files.length === 0) {
            return Response.json(
                { error: 'No files uploaded' },
                { status: 400 }
            );
        }

        // In a real implementation, you would:
        // 1. Process file uploads
        // 2. Store files in /public/templates/:id/
        // 3. Update template metadata

        const template = await dbInstance.findById('templates', params.id);
        if (!template) {
            return Response.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Simulate adding base layers
        const newLayers = files.map((_, i) => ({
            id: `layer-${Date.now()}-${i}`,
            name: `Base Layer ${i + 1}`,
            url: `/templates/${params.id}/layer-${i}.png`, // Placeholder
            zIndex: i
        }));

        const updatedTemplate = await dbInstance.update('templates', params.id, {
            baseLayers: [...template.baseLayers, ...newLayers],
            updatedAt: new Date().toISOString()
        });

        return Response.json({
            success: true,
            addedLayers: newLayers.length,
            templateId: params.id
        });
    } catch (error) {
        return Response.json(
            { error: 'File upload failed' },
            { status: 500 }
        );
    }
}
