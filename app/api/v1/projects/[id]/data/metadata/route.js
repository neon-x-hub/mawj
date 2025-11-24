// app/api/v1/projects/[id]/data/metadata/route.js
import datarows from "@/app/lib/providers/datarows";
import config from "@/app/lib/providers/config";
import { MetadataProvider, revalidators } from "@/app/lib/fam";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const provider = await datarows.getDataProvider();

        // Get refresh flag
        const url = new URL(request.url);
        const refresh = url.searchParams.get("refresh") === "true";

        // Setup metadata provider
        const DATA_DIR = await config.get("baseFolder") || "./data";
        const metadataFilePath = `${DATA_DIR}/datarows/${id}/fam.json`;

        const metadata = new MetadataProvider({
            filePath: metadataFilePath,
            revalidators,
            provider
        });

        // Load metadata (does NOT force revalidation)
        await metadata.load({ projectId: id });

        let totalCount, doneCount, columns;

        if (refresh) {
            // 🔄 Force-refresh all metadata keys
            totalCount = await metadata.revalidate("rowCount", { projectId: id });
            doneCount = await metadata.revalidate("doneCount", { projectId: id });
            columns = await metadata.revalidate("columns", { projectId: id });
        } else {
            // Normal mode: use cached values, fallback to revalidate if missing
            totalCount = metadata.get("rowCount");
            if (typeof totalCount !== "number") {
                totalCount = await metadata.revalidate("rowCount", { projectId: id });
            }

            doneCount = metadata.get("doneCount");
            if (typeof doneCount !== "number") {
                doneCount = await metadata.revalidate("doneCount", { projectId: id });
            }

            columns = metadata.get("columns");
            if (!Array.isArray(columns)) {
                columns = await metadata.revalidate("columns", { projectId: id });
            }
        }

        const columnNames = columns.map(col => col.n);

        return Response.json({
            total: totalCount,
            done: doneCount,
            columns: columnNames,
            refreshed: refresh
        });

    } catch (error) {
        console.error("❌ Metadata fetch error:", error);
        return Response.json(
            { error: "Failed to fetch metadata", details: error.message },
            { status: 500 }
        );
    }
}
