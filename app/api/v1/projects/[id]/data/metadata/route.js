import data from "@/app/lib/providers/datarows";

export async function GET(_, { params }) {
    try {
        const provider = await data.getDataProvider(params.id);
        const metadata = await provider.getMetadata();

        return Response.json({
            projectId: params.id,
            ...metadata
        });
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch metadata', details: error.message },
            { status: 500 }
        );
    }
}
