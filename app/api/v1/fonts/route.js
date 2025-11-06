import { collectFonts } from '@/app/lib/fonts/manager.js';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const nameParam = url.searchParams.get('name');

        const fonts = await collectFonts();

        if (nameParam) {
            const name = decodeURIComponent(nameParam).toLowerCase();
            const filtered = fonts.filter(f => f.name.toLowerCase().includes(name));

            if (filtered.length === 0) {
                return Response.json(
                    { success: false, message: 'Font not found', data: [] },
                    { status: 404 }
                );
            }

            return Response.json({ success: true, data: filtered });
        }

        return Response.json({ success: true, data: fonts });
    } catch (err) {
        console.error('Font listing failed:', err);
        return Response.json({ success: false }, { status: 500 });
    }
}
