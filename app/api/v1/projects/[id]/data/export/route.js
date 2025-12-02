import fs from "fs";
import path from "path";
import datarows from "@/app/lib/providers/datarows";
import { t } from "@/app/i18n";
import { stringify } from "csv-stringify/sync"; // synchronous version

export async function POST(request, { params }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { exportFolder: folder, exportFormat: format } = body;

        console.log("Export w/: ", format, "in ", folder);


        if (!folder || !format || !["csv", "json"].includes(format.toLowerCase())) {
            return Response.json(
                { error: t("messages.error.datarows.invalid_export_params") },
                { status: 400 }
            );
        }

        const provider = await datarows.getDataProvider();
        const allRows = await provider.find(id);
        const data = allRows.map(row => row.data);

        const baseDir = path.resolve(folder);
        if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

        const filePath = path.join(baseDir, `project_${id}.${format.toLowerCase()}`);

        if (format.toLowerCase() === "json") {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } else if (format.toLowerCase() === "csv") {
            const csv = stringify(data, { header: true });
            fs.writeFileSync(filePath, csv);
        }

        return Response.json({
            success: true,
            projectId: id,
            exportedRecords: data.length,
            filePath
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Export data error:", error);
        return Response.json(
            { error: t("messages.error.datarows.export_failed"), details: error.message },
            { status: 500 }
        );
    }
}
