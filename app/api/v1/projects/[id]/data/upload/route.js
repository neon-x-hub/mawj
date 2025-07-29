import data from "@/app/lib/providers/datarows";

export async function POST(request, { params }) {
    try {
        const formData = await request.formData();
        const csvFile = formData.get('file');

        if (!csvFile) {
            return Response.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const provider = await data.getDataProvider(params.id);
        const result = await provider.appendRows(await csvFile.text());

        return Response.json({
            success: true,
            projectId: params.id,
            ...result
        }, { status: 201 });
    } catch (error) {
        return Response.json(
            { error: 'Upload failed', details: error.message },
            { status: 500 }
        );
    }
}
