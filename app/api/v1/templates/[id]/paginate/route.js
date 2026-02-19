// POST /api/templates/:id/paginate
import db from "@/app/lib/providers/db";
import { t } from "@/app/i18n";
import { layoutProbeRender } from "@/app/lib/engine/image/LayoutProbeRender";

export async function POST(request, { params }) {
    const dbInstance = await db.getDB();
    const { id: templateId } = await params;

    try {
        const body = await request.json();
        const { row, layerId, options = {} } = body;

        if (!layerId) {
            return Response.json(
                { error: "Missing layerId" },
                { status: 400 }
            );
        }

        if (!row || typeof row !== "object") {
            return Response.json(
                { error: "Missing or invalid row" },
                { status: 400 }
            );
        }

        const template = await dbInstance.findById('templates', templateId);
        if (!template) {
            return Response.json(
                { error: t('messages.error.template.single.not_found') },
                { status: 404 }
            );
        }

        const result = await layoutProbeRender({
            project: null,
            template,
            layerId,
            row,
            options,
        });

        return Response.json({
            templateId,
            layerId,
            chunks: result.chunks,
        });

    } catch (error) {
        console.error("Layout probe failed:", error);

        return Response.json(
            { error: "Layout probe failed" },
            { status: 500 }
        );
    }
}
