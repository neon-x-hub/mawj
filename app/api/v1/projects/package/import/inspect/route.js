import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import inspectZip from '@/app/lib/package/import/inspect';
import config from '@/app/lib/providers/config';

const DATA_DIR = await config.get('baseFolder') || './data';

export async function POST(request) {
    try {
        // 1. Parse form data & get the uploaded zip file
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
            return Response.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 2. Validate mimetype for basic check (optional)
        if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
            return Response.json({ error: 'Invalid file type, expected ZIP archive' }, { status: 400 });
        }

        // 3. Save the uploaded zip file to a temp folder
        const tempDir = path.join(os.tmpdir(), 'zip_inspections');
        await fs.mkdir(tempDir, { recursive: true });
        const tempZipPath = path.join(tempDir, `${Date.now()}_${file.name}`);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(tempZipPath, buffer);

        // 4. Run your inspection on the saved file
        const { suspicious, totalUncompressed, datarowsSize, outputsSize } = await inspectZip(tempZipPath, [
            '.json', '.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov', '.avi', '.txt', '.csv', '.ttf', '.otf', '.woff', '.woff2'
        ]);

        // 5. Cleanup the temp file
        await fs.unlink(tempZipPath);

        // 6. Return inspection results to client
        return Response.json({
            success: true,
            suspicious,
            totalUncompressed,
            datarowsSize,
            outputsSize
        });
    } catch (error) {
        console.error('❌ Zip inspection error:', error);
        return Response.json({ error: 'Zip inspection failed', details: error.message }, { status: 500 });
    }
}
