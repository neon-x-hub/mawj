import datarows from "@/app/lib/providers/datarows";
import config from "@/app/lib/providers/config";
import { MetadataProvider, revalidators } from "@/app/lib/fam";

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const { searchParams } = new URL(request.url);
        const provider = await datarows.getDataProvider();

        // ✅ Setup metadata provider
        const DATA_DIR = await config.get('baseFolder') || './data';
        const metadataFilePath = `${DATA_DIR}/datarows/${id}/fam.json`;
        const metadata = new MetadataProvider({
            filePath: metadataFilePath,
            revalidators,
            provider
        });
        await metadata.load({ projectId: id });

        // ✅ Pagination
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 100;
        const offset = (page - 1) * limit;

        // ✅ Sorting
        const sortAttribute = searchParams.get('sort');
        const sortOrder = searchParams.get('sd') || '0'; // 0 = asc, 1 = desc
        const isMetaSort = sortAttribute?.startsWith('m.');

        // ✅ Filters
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
            if (!['page', 'limit', 'sort', 'sd'].includes(key)) {
                filters[key] = value;
                if (key === 'm.status') filters['m.status'] = value === 'true';
            }
        }

        // ✅ Fetch page of rows
        const rawRows = await provider.find(
            id,
            filters,
            { limit, offset }
        );

        // ✅ Normalize rows
        const allRows = rawRows.map((row, index) => ({
            id: row.id || `${offset + index + 1}`,
            status: typeof row.status === 'boolean' ? row.status : false,
            createdAt: row.createdAt ? new Date(row.createdAt) : null,
            updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
            data: row.data || row
        }));

        // ✅ Sort
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

        // ✅ Extract columns for this page
        const columns = new Set();
        allRows.forEach(doc => {
            Object.keys(doc.data || {}).forEach(key => columns.add(key));
        });

        // ✅ Get total row count from metadata (revalidate if missing)
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
