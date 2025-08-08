import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { collectFontsFromLayers } from '../../engine/image/renderer';
import { getFontByName } from '../../fonts/manager.js';
import config from '../../providers/config';

const DATA_DIR = await config.get('baseFolder') || './data';
const BASE_URL = process.env.ASSET_HOST || 'http://localhost:3000';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {Object} project
 * @param {Object} template
 * @param {Object} options
 * @param {Object} options.include
 * @param {Function} options.onProgress
 * @param {String} options.outputDir - custom directory to place zip file in
 * @returns {Promise<string>} path to zip file
 */
export async function createProjectBundle(project, template, options = {}) {
    const {
        include = {
            metadata: true,
            template: true,
            baseLayers: true,
            datarows: true,
            outputs: true,
            fonts: true
        },
        onProgress = () => { },
        outputDir = path.join(__dirname, 'temp', project.id)  // default behavior preserved
    } = options;

    fs.mkdirSync(outputDir, { recursive: true });

    const zipPath = path.join(outputDir, `${project.id}.mawj.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    let totalSteps = Object.values(include).filter(Boolean).length;
    let completed = 0;

    const updateProgress = () => {
        const progress = Math.round((completed / totalSteps) * 100);
        onProgress(progress);
    };

    return new Promise(async (resolve, reject) => {
        output.on('close', () => resolve(zipPath));
        archive.on('error', reject);
        archive.pipe(output);

        try {
            if (include.metadata) {
                archive.append(JSON.stringify(project, null, 2), { name: 'metadata.json' });
                completed++;
                updateProgress();
            }

            if (include.template) {
                const templateDir = path.join(outputDir, 'template');
                fs.mkdirSync(templateDir, { recursive: true });

                const templateMetadataPath = path.join(templateDir, 'metadata.json');
                fs.writeFileSync(templateMetadataPath, JSON.stringify(template, null, 2));
                archive.file(templateMetadataPath, { name: 'template/metadata.json' });

                completed++;
                updateProgress();
            }

            if (include.baseLayers) {
                const baseLayersDir = path.join(outputDir, 'template', 'base_layers');
                fs.mkdirSync(baseLayersDir, { recursive: true });

                const templateBaseFolder = path.join(DATA_DIR, 'templates', template.id, 'base_layers');
                if (fs.existsSync(templateBaseFolder)) {
                    const baseLayerFiles = fs.readdirSync(templateBaseFolder);
                    for (const file of baseLayerFiles) {
                        const sourcePath = path.join(templateBaseFolder, file);
                        const destPath = path.join(baseLayersDir, file);
                        fs.copyFileSync(sourcePath, destPath);
                        archive.file(sourcePath, { name: `template/base_layers/${file}` });
                    }
                }

                completed++;
                updateProgress();
            }

            if (include.datarows) {
                const datarowsFolder = path.join(DATA_DIR, 'datarows', project.id);
                if (fs.existsSync(datarowsFolder)) {
                    const datarowFiles = fs.readdirSync(datarowsFolder)
                        .filter(file => file.startsWith('segment_') && file.endsWith('.json'));

                    if (datarowFiles.length > 0) {
                        archive.directory(datarowsFolder, 'datarows');
                    }
                }

                completed++;
                updateProgress();
            }

            if (include.outputs) {
                const outputsFolder = path.join(DATA_DIR, 'projects', 'outputs', project.id);
                if (fs.existsSync(outputsFolder)) {
                    const outputFiles = fs.readdirSync(outputsFolder);
                    if (outputFiles.length > 0) {
                        archive.directory(outputsFolder, 'outputs');
                    }
                }

                completed++;
                updateProgress();
            }

            if (include.fonts) {
                const fontsDir = path.join(outputDir, 'assets', 'fonts');
                fs.mkdirSync(fontsDir, { recursive: true });

                const fontFamilies = collectFontsFromLayers(template.layers);
                const totalFonts = fontFamilies.length;

                if (totalFonts === 0) {
                    completed++;
                    updateProgress();
                } else {
                    totalSteps += totalFonts - 1;

                    for (const fontName of fontFamilies) {
                        const font = await getFontByName(fontName);
                        if (!font) continue;

                        const fontUrl = BASE_URL + font.url;
                        const rawName = font.url.split('?file=')[1] || path.basename(font.url);
                        const fontFileName = decodeURIComponent(rawName);
                        const fontPath = path.join(fontsDir, fontFileName);

                        try {
                            const response = await axios.get(fontUrl, { responseType: 'stream' });
                            const writer = fs.createWriteStream(fontPath);
                            response.data.pipe(writer);

                            await new Promise((resolve, reject) => {
                                writer.on('finish', resolve);
                                writer.on('error', reject);
                            });

                            archive.file(fontPath, { name: `assets/fonts/${fontFileName}` });
                        } catch (e) {
                            console.warn(`Font failed: ${fontName}`, e.message);
                        }

                        completed++;
                        updateProgress();
                    }
                }
            }

            archive.finalize();
        } catch (err) {
            reject(err);
        }
    });
}


export function cleanupBundle(zipPath) {
    const tempDir = path.dirname(zipPath);
    try {
        fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.error('Error cleaning up bundle:', error);
    }
}
