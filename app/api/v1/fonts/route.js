import { collectFonts } from '@/app/lib/fonts/manager.js';

export async function GET() {
    try {
        const fonts = await collectFonts();
        return Response.json({ success: true, data: fonts });
    } catch (err) {
        console.error('Font listing failed:', err);
        return Response.json({ success: false }, { status: 500 });
    }
}
