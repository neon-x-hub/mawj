import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { enqueueImportJob } from '@/app/lib/package/import/enqueue';

export async function POST(request) {
    try {
        // 1️⃣ Parse form data
        const formData = await request.formData();

        // 2️⃣ Get uploaded ZIP file
        const file = formData.get('file');
        if (!file) {
            return Response.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 3️⃣ Validate MIME type
        if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
            return Response.json({ error: 'Invalid file type, expected ZIP archive' }, { status: 400 });
        }

        // 4️⃣ Get options from formData (stringified JSON from frontend)
        let importOptions = {};
        const optionsRaw = formData.get('options');
        if (optionsRaw) {
            try {
                importOptions = JSON.parse(optionsRaw);
            } catch (err) {
                return Response.json({ error: 'Invalid options JSON', details: err.message }, { status: 400 });
            }
        }

        // 5️⃣ Save ZIP file to a temp dir
        const tempDir = path.join(os.tmpdir(), 'project_imports');
        await fs.mkdir(tempDir, { recursive: true });
        const tempZipPath = path.join(tempDir, `${Date.now()}_${file.name}`);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(tempZipPath, buffer);

        // 6️⃣ Queue import job
        const jobId = enqueueImportJob({
            zipFilePath: tempZipPath,
            options: importOptions
        });

        // 7️⃣ Respond
        return Response.json({ jobId, status: 'queued' });
    } catch (err) {
        console.error('❌ Error in /api/v1/project/package/import:', err);
        return Response.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
