import datarows from "@/app/lib/providers/datarows";
import { parse } from "csv-parse/sync";
import stats from "@/app/lib/helpers/stats";
import config from "@/app/lib/providers/config";
import { MetadataProvider, revalidators } from "@/app/lib/fam";
import { t } from "@/app/i18n";

export async function POST(request, { params }) {
    const { id } = await params;

    try {
        const startTime = Date.now();

        // ✅ 1. Parse FormData & get uploaded file
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
            return Response.json({ error: t("messages.error.datarows.no_file_uploaded") }, { status: 400 });
        }

        // ✅ 2. Determine file extension
        let extension = "";
        if (file.name) {
            extension = file.name.toLowerCase().split(".").pop();
        } else if (file.type === "application/json") {
            extension = "json";
        } else if (file.type === "text/csv") {
            extension = "csv";
        }

        // ✅ 3. Read file content safely
        const buffer = await file.arrayBuffer();
        const fileContent = new TextDecoder().decode(buffer);

        // ✅ 4. Parse based on file type
        let rawRecords = [];
        if (extension === "json") {
            try {
                rawRecords = JSON.parse(fileContent);
                if (!Array.isArray(rawRecords)) {
                    throw new Error(t("messages.error.datarows.json_not_array"));
                }
            } catch (err) {
                return Response.json(
                    { error: t("messages.error.datarows.invalid_json"), details: err.message },
                    { status: 400 }
                );
            }
        } else if (extension === "csv") {
            try {
                rawRecords = parse(fileContent, {
                    columns: true,
                    skip_empty_lines: true
                });
            } catch (err) {
                return Response.json(
                    { error: t("messages.error.datarows.invalid_csv"), details: err.message },
                    { status: 400 }
                );
            }
        } else {
            return Response.json(
                { error: t("messages.error.datarows.unsupported_file_type") },
                { status: 400 }
            );
        }

        // ✅ 5. Transform records
        const documents = rawRecords.map((record) => ({
            status: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: record
        }));

        // ✅ 6. Save to DB
        const provider = await datarows.getDataProvider();
        await provider.bulkCreate(id, documents);

        // ✅ 7. Update metadata provider incrementally
        const DATA_DIR = await config.get("baseFolder") || "./data";
        const metadataFilePath = `${DATA_DIR}/datarows/${id}/fam.json`;

        const metadata = new MetadataProvider({
            filePath: metadataFilePath,
            revalidators,
            provider
        });
        await metadata.load({ projectId: id });

        // Update rowCount incrementally
        const currentCount = metadata.get("rowCount") || 0;
        metadata.set("rowCount", currentCount + documents.length);

        // Update columns incrementally
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

        // ✅ 8. Log stats event
        await stats.add({
            projectId: id,
            action: "data_ingestion",
            data: {
                count: documents.length,
                timeTaken: endTime - startTime,
            },
        });

        // ✅ 9. Respond
        return Response.json(
            {
                success: true,
                projectId: id,
                addedRecords: documents.length,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("❌ Upload Error:", error);
        return Response.json(
            { error: t("messages.error.datarows.upload_failed"), details: error.message },
            { status: 500 }
        );
    }
}
