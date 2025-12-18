import datarows from "@/app/lib/providers/datarows";
import config from "@/app/lib/providers/config";
import { MetadataProvider, revalidators } from "@/app/lib/fam";
import { t } from "@/app/i18n";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const { searchParams } = new URL(request.url);
        const provider = await datarows.getDataProvider();

        const DATA_DIR = await config.get("baseFolder") || "./data";
        const metadataFilePath = `${DATA_DIR}/datarows/${id}/fam.json`;
        const metadata = new MetadataProvider({
            filePath: metadataFilePath,
            revalidators,
            provider
        });
        await metadata.load({ projectId: id });

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 100;
        const offset = (page - 1) * limit;

        const sortAttribute = searchParams.get("sort");
        const sortOrder = searchParams.get("sd") || "0"; // 0 = asc, 1 = desc
        const isMetaSort = sortAttribute?.startsWith("m.");

        const filters = {};
        for (const [key, value] of searchParams.entries()) {
            if (!["page", "limit", "sort", "sd"].includes(key)) {
                filters[key] = value;
                if (key === "m.status") filters["m.status"] = value === "true";
            }
        }

        const rawRows = await provider.find(id, filters, { limit, offset });

        const allRows = rawRows.map((row, index) => ({
            id: row.id || `${offset + index + 1}`,
            status: typeof row.status === "boolean" ? row.status : false,
            createdAt: row.createdAt ? new Date(row.createdAt) : null,
            updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
            data: row.data || row
        }));

        if (sortAttribute) {
            const attr = isMetaSort ? sortAttribute.slice(2) : sortAttribute;

            allRows.sort((a, b) => {
                const aVal = isMetaSort ? a[attr] : a.data?.[attr];
                const bVal = isMetaSort ? b[attr] : b.data?.[attr];

                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return sortOrder === '0' ? -1 : 1;
                if (bVal == null) return sortOrder === '0' ? 1 : -1;

                if (aVal < bVal) return sortOrder === '0' ? -1 : 1;
                if (aVal > bVal) return sortOrder === '0' ? 1 : -1;
                return 0;
            });
        }

        const columns = new Set();
        allRows.forEach(doc => {
            Object.keys(doc.data || {}).forEach(key => columns.add(key));
        });

        let totalRows = metadata.get("rowCount");
        if (typeof totalRows !== "number") {
            totalRows = await metadata.revalidate("rowCount", { projectId: id });
        }

        return Response.json({
            projectId: id,
            columns: Array.from(columns),
            total: totalRows,
            hasNextPage: (offset + limit) < totalRows,
            page,
            limit,
            data: allRows
        });
    } catch (error) {
        console.error("❌ Fetch project data error:", error);
        return Response.json(
            {
                error: t("messages.error.datarows.fetch_failed"),
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    const { id } = await params;

    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return Response.json(
                { error: t("messages.error.datarows.invalid_input") },
                { status: 400 }
            );
        }

        const provider = await datarows.getDataProvider();

        const DATA_DIR = await config.get("baseFolder") || "./data";
        const metadataFilePath = `${DATA_DIR}/datarows/${id}/fam.json`;
        const metadata = new MetadataProvider({
            filePath: metadataFilePath,
            revalidators,
            provider
        });
        await metadata.load({ projectId: id });

        const updates = [];
        const deletes = [];
        for (const item of body) {
            if (!item?.id) continue;
            if (item.updates === null) {
                deletes.push(item.id);
            } else {
                updates.push({ id: item.id, data: item.updates });
            }
        }

        // --- BULK DELETE ---
        if (deletes.length > 0) {
            const existingRows = await provider.bulkFindByIds(id, deletes);

            // Update rowCount
            let rowCount = metadata.get("rowCount") || 0;
            rowCount = Math.max(0, rowCount - existingRows.length);
            metadata.set("rowCount", rowCount);

            // Update doneCount
            let doneCount = metadata.get("doneCount") || 0;
            const deletedDone = existingRows.filter(r => r.status).length;
            doneCount = Math.max(0, doneCount - deletedDone);
            metadata.set("doneCount", doneCount);

            // Update column counts
            let columns = metadata.get("columns") || [];
            const colMap = new Map(columns.map(c => [c.n, c.c]));
            existingRows.forEach(row => {
                Object.keys(row.data || {}).forEach(key => {
                    if (colMap.has(key)) {
                        const newCount = colMap.get(key) - 1;
                        if (newCount > 0) colMap.set(key, newCount);
                        else colMap.delete(key);
                    }
                });
            });
            metadata.set("columns", Array.from(colMap, ([n, c]) => ({ n, c })));

            await provider.bulkDelete(id, deletes);
        }

        // --- BULK UPDATE ---
        if (updates.length > 0) {
            const ids = updates.map(u => u.id);
            const existingRows = await provider.bulkFindByIds(id, ids);
            const rowMap = new Map(existingRows.map(r => [r.id, r]));

            let doneCount = metadata.get("doneCount") || 0;
            let columns = metadata.get("columns") || [];
            const colMap = new Map(columns.map(c => [c.n, c.c]));

            updates.forEach(update => {
                const currentRow = rowMap.get(update.id);
                if (!currentRow) return;

                const wasDone = currentRow.status;
                const willBeDone = update.data.status ?? currentRow.status;
                if (wasDone !== willBeDone) {
                    doneCount += willBeDone ? 1 : -1;
                }

                const oldCols = new Set(Object.keys(currentRow.data || {}));
                const newCols = new Set(Object.keys(update.data.data || currentRow.data || {}));

                // Added columns
                for (const key of newCols) {
                    if (!oldCols.has(key)) {
                        colMap.set(key, (colMap.get(key) || 0) + 1);
                    }
                }
            });

            metadata.set("doneCount", doneCount);
            metadata.set("columns", Array.from(colMap, ([n, c]) => ({ n, c })));

            await provider.bulkUpdate(id, updates);
        }

        await metadata.save();

        return Response.json({
            success: true,
            updated: updates.map(u => u.id),
            deleted: deletes
        });
    } catch (error) {
        console.error("❌ Bulk update/delete error:", error);
        return Response.json(
            {
                error: t("messages.error.datarows.bulk_failed"),
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
