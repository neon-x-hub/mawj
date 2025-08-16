import datarows from "@/app/lib/providers/datarows";
import config from "@/app/lib/providers/config";
import stats from "@/app/lib/helpers/stats";
import { MetadataProvider, revalidators } from "@/app/lib/fam";
import { t } from "@/app/i18n";

export async function POST(request, { params }) {
    const { id } = await params;

    try {
        const startTime = Date.now();

        // 1️⃣ Parse JSON body
        const body = await request.json();
        if (!Array.isArray(body)) {
            return Response.json(
                { error: t("messages.error.datarows.invalid_input") },
                { status: 400 }
            );
        }

        // 2️⃣ Prepare documents
        const documents = body.map(record => ({
            status: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: record
        }));

        // 3️⃣ Save to DB in bulk
        const provider = await datarows.getDataProvider();
        await provider.bulkCreate(id, documents);

        // 4️⃣ Update metadata incrementally
        const DATA_DIR = await config.get("baseFolder") || "./data";
        const metadataFilePath = `${DATA_DIR}/datarows/${id}/fam.json`;

        const metadata = new MetadataProvider({
            filePath: metadataFilePath,
            revalidators,
            provider
        });
        await metadata.load({ projectId: id });

        // Row count update
        const currentCount = metadata.get("rowCount") || 0;
        metadata.set("rowCount", currentCount + documents.length);

        // Column counts update
        const currentColumns = metadata.get("columns") || [];
        const colMap = new Map(currentColumns.map(c => [c.n, c.c]));

        documents.forEach(doc => {
            Object.keys(doc.data || {}).forEach(key => {
                colMap.set(key, (colMap.get(key) || 0) + 1);
            });
        });

        metadata.set(
            "columns",
            Array.from(colMap.entries()).map(([n, c]) => ({ n, c }))
        );

        await metadata.save();

        const endTime = Date.now();

        // 5️⃣ Log stats
        await stats.add({
            projectId: id,
            action: "data_ingestion",
            data: {
                count: documents.length,
                timeTaken: endTime - startTime,
            },
        });

        // 6️⃣ Respond
        return Response.json({
            success: true,
            projectId: id,
            addedRecords: documents.length
        }, { status: 201 });

    } catch (error) {
        console.error("❌ POST data error:", error);
        return Response.json(
            { error: t("messages.error.datarows.save_failed"), details: error.message },
            { status: 500 }
        );
    }
}
