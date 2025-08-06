import datarows from "@/app/lib/providers/datarows";

export async function GET(_, { params }) {
    const { id } = await params;
    try {
        const provider = await datarows.getDataProvider();

        // a function that returns the number of done and undone rows
        const allRows = await provider.find(id);

        if (!allRows) {
            return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        const metadata = {}

        metadata.done = allRows.filter(row => row.status).length;
        metadata.total = allRows.length;

        return Response.json({
            ...metadata
        });
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch allRows', details: error.message },
            { status: 500 }
        );
    }
}
