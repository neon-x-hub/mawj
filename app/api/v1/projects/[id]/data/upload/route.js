import datarows from "@/app/lib/providers/datarows";
import { parse } from "csv-parse/sync";

export async function POST(request, { params }) {
    const { id } = await params;

    try {
        // ✅ 1. Parse FormData & get uploaded file
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
            return Response.json({ error: "No file uploaded" }, { status: 400 });
        }

        // ✅ 2. Determine file extension (safe handling)
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
                    throw new Error("JSON file must contain an array of objects");
                }
            } catch (err) {
                return Response.json(
                    { error: "Invalid JSON format", details: err.message },
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
                    { error: "Invalid CSV format", details: err.message },
                    { status: 400 }
                );
            }
        } else {
            return Response.json(
                { error: "Unsupported file type. Only .csv or .json allowed." },
                { status: 400 }
            );
        }

        // ✅ 5. Transform records into expected format
        const documents = rawRecords.map((record) => ({
            status: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: record
        }));

        // ✅ 6. Use datarows singleton & save to DB
        const provider = await datarows.getDataProvider();
        const result = await provider.bulkCreate(id, documents);

        // ✅ 7. Respond with success
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
            { error: "Upload failed", details: error.message },
            { status: 500 }
        );
    }
}
