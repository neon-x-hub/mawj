// app/api/v1/projects/[id]/data/metadata/route.js
import datarows from "@/app/lib/providers/datarows";
import config from "@/app/lib/providers/config";
import { MetadataProvider, revalidators } from "@/app/lib/fam";

export async function GET(_, { params }) {
    const { id } = await params;

    try {
        const provider = await datarows.getDataProvider();

        // ✅ Setup metadata provider
        const DATA_DIR = await config.get("baseFolder") || "./data";
        const metadataFilePath = `${DATA_DIR}/datarows/${id}/fam.json`;

        const metadata = new MetadataProvider({
            filePath: metadataFilePath,
            revalidators,
            provider
        });

        // ✅ Load metadata, populate if missing
        await metadata.load({ projectId: id });

        // ✅ Row count
        let totalCount = metadata.get("rowCount");
        if (typeof totalCount !== "number") {
            totalCount = await metadata.revalidate("rowCount", { projectId: id });
        }

        // ✅ Done count
        let doneCount = metadata.get("doneCount");
        if (typeof doneCount !== "number") {
            doneCount = await metadata.revalidate("doneCount", { projectId: id });
        }

        // ✅ Columns (return only names)
        let columns = metadata.get("columns");
        if (!Array.isArray(columns)) {
            columns = await metadata.revalidate("columns", { projectId: id });
        }
        const columnNames = columns.map(col => col.n);

        return Response.json({
            total: totalCount,
            done: doneCount,
            columns: columnNames
        });

    } catch (error) {
        console.error("❌ Metadata fetch error:", error);
        return Response.json(
            { error: "Failed to fetch metadata", details: error.message },
            { status: 500 }
        );
    }
}
