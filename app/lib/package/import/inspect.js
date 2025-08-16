import fs from 'fs';
import path from 'path';
import yauzl from 'yauzl';
import { t } from '@/app/i18n';

function inspectZip(zipPath, allowedExtensions = []) {
    return new Promise((resolve, reject) => {
        const suspicious = [];
        let totalUncompressed = 0;
        let datarowsSize = 0;
        let outputsSize = 0;

        yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
            if (err) return reject(err);

            zipfile.readEntry();

            zipfile.on('entry', (entry) => {
                const fileName = entry.fileName;
                const ext = path.extname(fileName).toLowerCase();
                const isAllowed = allowedExtensions.length === 0 || allowedExtensions.includes(ext);

                // Path traversal check
                if (fileName.includes('..') || path.isAbsolute(fileName)) {
                    suspicious.push({ file: fileName, reason: t('messages.suspicious.import.path_traversal') });
                    zipfile.readEntry();
                    return;
                }

                // Extension check (only files)
                if (!isAllowed && !(entry.fileName.endsWith('/'))) {
                    suspicious.push({ file: fileName, reason: `${t('messages.suspicious.import.invalid_extension')}: ${ext}` });
                }

                // Track total uncompressed size
                totalUncompressed += entry.uncompressedSize;

                // Track datarows folder size
                if (fileName.startsWith('datarows/') && !(entry.fileName.endsWith('/'))) {
                    datarowsSize += entry.uncompressedSize;
                }

                // Track outputs folder size
                if (fileName.startsWith('outputs/') && !(entry.fileName.endsWith('/'))) {
                    outputsSize += entry.uncompressedSize;
                }

                // Warn if single file > 500MB
                if (entry.uncompressedSize > 500 * 1024 * 1024) {
                    suspicious.push({ file: fileName, reason: t('messages.suspicious.import.large_file') });
                }

                zipfile.readEntry();
            });

            zipfile.on('end', () => {
                resolve({
                    suspicious,
                    totalUncompressed,
                    datarowsSize,
                    outputsSize,
                });
            });

            zipfile.on('error', (err) => {
                reject(err);
            });
        });
    });
}

export default inspectZip;
