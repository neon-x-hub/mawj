import fs from 'fs/promises';
import path from 'path';
import data from "@/app/lib/providers/datarows";

export async function GET(request, { params }) {
    await params;
    try {
        const { searchParams } = new URL(request.url);
        const provider = await data.getDataProvider(params.id);

        // Handle pagination
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 100;
        const offset = (page - 1) * limit;

        // Handle filters
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
            if (!['page', 'limit'].includes(key)) {
                filters[key] = value;
            }
        }

        const allRows = await provider.findRows(filters);
        const paginatedRows = allRows.slice(offset, offset + limit);

        return Response.json({
            projectId: params.id,
            total: allRows.length,
            page,
            limit,
            data: paginatedRows
        });
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch data', details: error.message },
            { status: 500 }
        );
    }
}


export async function DELETE(request, { params }) {
    await params;
    try {
        const { searchParams } = new URL(request.url);
        const provider = await data.getDataProvider(params.id);

        // Handle file deletion
        if (searchParams.has('file')) {
            const fileName = searchParams.get('file');
            const metadata = await provider.getMetadata();

            if (!metadata.files.includes(fileName)) {
                return Response.json(
                    { error: 'File not found in project' },
                    { status: 404 }
                );
            }

            // Count rows in file before deletion
            const filePath = path.join(DATA_DIR, params.id, 'data', fileName);
            const content = await fs.readFile(filePath, 'utf8');
            const rowCount = parse(content, { columns: true }).length;

            await fs.unlink(filePath);

            // Update metadata
            await fs.writeFile(
                path.join(DATA_DIR, params.id, 'data', 'metadata.json'),
                JSON.stringify({
                    ...metadata,
                    files: metadata.files.filter(f => f !== fileName),
                    totalRows: metadata.totalRows - rowCount
                }, null, 2)
            );

            return Response.json({
                success: true,
                deletedFile: fileName,
                deletedRows: rowCount
            });
        }
        // Handle row deletion
        else if (searchParams.has('rowId')) {
            const rowId = searchParams.get('rowId');
            const deleted = await provider.deleteRow(rowId);

            if (!deleted) {
                return Response.json(
                    { error: 'Row not found' },
                    { status: 404 }
                );
            }

            return Response.json({
                success: true,
                deletedRow: rowId
            });
        }
        // Handle bulk deletion with filters
        else if (searchParams.has('filter')) {
            const filter = JSON.parse(searchParams.get('filter'));
            const deletedCount = await provider.deleteRows(filter);

            return Response.json({
                success: true,
                deletedCount,
                filter
            });
        }
        else {
            return Response.json(
                { error: 'Specify either file, rowId, or filter parameter' },
                { status: 400 }
            );
        }
    } catch (error) {
        return Response.json(
            { error: 'Deletion failed', details: error.message },
            { status: 500 }
        );
    }
}
