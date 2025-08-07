// GET /api/v1/projects/:id/stats/
import db from "@/app/lib/providers/db";
import stats from "@/app/lib/helpers/stats";

export async function GET(_, { params }) {
    const { id } = await params;
    const dbInstance = await db.getDB();
    try {
        const project = await dbInstance.findById("projects", id);
        if (!project) {
            return Response.json({ error: "Project not found" }, { status: 404 });
        }
        const analysedStats = await stats.analyze(id);
        return Response.json({ stats: analysedStats });
    } catch (error) {
        return Response.json({ error: "Failed to fetch project", details: error.message }, { status: 500 });
    }
}
