import fs from 'fs/promises';
import path from 'path';
import datarows from "@/app/lib/providers/datarows";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const { searchParams } = new URL(request.url);
        const provider = await datarows.getDataProvider();

        // ✅ Pagination
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 100;
        const offset = (page - 1) * limit;

        // ✅ Filters (excluding pagination params)
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
            if (!['page', 'limit'].includes(key)) filters[key] = value;
        }

        // ✅ Fetch raw rows from provider
        const rawRows = await provider.find(id, filters, {
            limit: limit + 1, // fetch extra record to check for next page
            offset
        });

        // ✅ Normalize into {id, status, data}
        const allRows = rawRows.map((row, index) => ({
            id: row.id || `${offset + index + 1}`,   // fallback id if missing
            status: typeof row.status === "boolean" ? row.status : false,
            data: row.data || row                    // fallback to whole row if no data key
        }));

        // ✅ Extract columns from nested data objects
        const columns = new Set();
        allRows.forEach(doc => {
            Object.keys(doc.data || {}).forEach(key => columns.add(key));
        });

        return Response.json({
            projectId: id,
            columns: Array.from(columns),
            hasNextPage: rawRows.length > limit,
            page,
            limit,
            data: allRows.slice(0, limit) // Return paginated normalized docs
        });
    } catch (error) {
        console.error("❌ Fetch project data error:", error);
        return Response.json(
            { error: "Failed to fetch data", details: error.message },
            { status: 500 }
        );
    }
}


export async function POST(request, { params }) {
    const { id } = await params;

    try {
        const body = await request.json();

        if (!Array.isArray(body)) {
            return Response.json({ error: "Invalid input, expected an array" }, { status: 400 });
        }

        const provider = await datarows.getDataProvider();

        // ✅ Separate updates and deletes
        const updates = [];
        const deletes = [];

        for (const item of body) {
            if (!item?.id) continue; // skip invalid entries
            if (item.updates === null) {
                deletes.push(item.id);
            } else {
                updates.push({ id: item.id, data: item.updates });
            }
        }

        // ✅ Perform bulk operations
        if (updates.length > 0) {
            await provider.bulkUpdate(id, updates);
        }

        if (deletes.length > 0) {
            await provider.bulkDelete(id, deletes);
        }

        return Response.json({
            success: true,
            updated: updates.map(u => u.id),
            deleted: deletes
        });
    } catch (error) {
        console.error("❌ Bulk update/delete error:", error);
        return Response.json(
            { error: "Failed to process data", details: error.message },
            { status: 500 }
        );
    }
}
