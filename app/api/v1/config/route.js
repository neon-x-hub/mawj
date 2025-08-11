import config from "@/app/lib/providers/config";

export async function GET() {
    try {
        const configData = await config.getConfig();
        return Response.json({ success: true, data: configData });
    } catch (err) {
        console.error('Config fetch failed:', err);
        return Response.json({ success: false }, { status: 500 });
    }
}
