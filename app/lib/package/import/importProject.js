import fs from "fs";
import path from "path";
import os from "os";
import yauzl from "yauzl";
import { pipeline } from "stream";
import { promisify } from "util";
import generateId from "../../id/generate";
import config from "../../providers/config";
import datarows from "../../providers/datarows";
import db from "../../providers/db";
import stats from "../../helpers/stats";

const pipe = promisify(pipeline);

const VALID_ID_REGEX = /^[0-9]+_[a-z0-9]+$/;
const BASE_LAYER_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const OUTPUT_EXTS = new Set([...BASE_LAYER_EXTS, ".mp4", ".mov"]);

async function extractZip(zipFilePath, destDir) {
    return new Promise((resolve, reject) => {
        yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipfile) => {
            if (err) return reject(err);

            zipfile.readEntry();

            zipfile.on("entry", (entry) => {
                const entryPath = path.join(destDir, entry.fileName);

                if (/\/$/.test(entry.fileName)) {
                    // Directory
                    fs.mkdirSync(entryPath, { recursive: true });
                    zipfile.readEntry();
                } else {
                    // File
                    fs.mkdirSync(path.dirname(entryPath), { recursive: true });

                    zipfile.openReadStream(entry, (err, readStream) => {
                        if (err) return reject(err);

                        const writeStream = fs.createWriteStream(entryPath);

                        pipe(readStream, writeStream)
                            .then(() => {
                                zipfile.readEntry();
                            })
                            .catch(reject);
                    });
                }
            });

            zipfile.on("end", () => {
                zipfile.close();
                resolve();
            });

            zipfile.on("error", reject);
        });
    });
}

export async function importProjectBundle(
    zipFilePath,
    {
        onProgress = () => { },
        outputFontsDir = null,
        includeOutputs = true,
        includeDatarows = true
    } = {}
) {
    const DATA_DIR = (await config.get("baseFolder")) || "./data";
    const tempExtractDir = path.join(DATA_DIR, "temp_import", generateId());
    fs.mkdirSync(tempExtractDir, { recursive: true });

    const dbInstance = await db.getDB();

    let step = 0;
    const totalSteps = 7;
    const progress = () => onProgress(Math.round((step / totalSteps) * 100));

    try {
        // 1️⃣ Extract ZIP
        await extractZip(zipFilePath, tempExtractDir);
        step++;
        progress();

        // 2️⃣ Load template metadata
        const templateMetadataPath = path.join(tempExtractDir, "template", "metadata.json");
        const templateMeta = JSON.parse(fs.readFileSync(templateMetadataPath, "utf8"));

        delete templateMeta.id;
        templateMeta.createdAt = new Date().toISOString();
        templateMeta.updatedAt = new Date().toISOString();

        const newTemplate = await dbInstance.create("templates", templateMeta);
        const newTemplateId = newTemplate.id;

        step++;
        progress();

        // 3️⃣ Copy base layers (with extension validation)
        const baseLayersSrc = path.join(tempExtractDir, "template", "base_layers");
        if (fs.existsSync(baseLayersSrc)) {
            const baseLayersDest = path.join(DATA_DIR, "templates", newTemplateId, "base_layers");
            fs.mkdirSync(baseLayersDest, { recursive: true });
            for (const file of fs.readdirSync(baseLayersSrc)) {
                if (BASE_LAYER_EXTS.has(path.extname(file).toLowerCase())) {
                    fs.copyFileSync(path.join(baseLayersSrc, file), path.join(baseLayersDest, file));
                } else {
                    console.warn(`⚠ Skipping invalid base layer file: ${file}`);
                }
            }
        }
        step++;
        progress();

        // 4️⃣ Load project metadata
        const projectMetadataPath = path.join(tempExtractDir, "metadata.json");
        const projectMeta = JSON.parse(fs.readFileSync(projectMetadataPath, "utf8"));

        delete projectMeta.id;
        projectMeta.template = newTemplateId;
        projectMeta.createdAt = new Date().toISOString();
        projectMeta.updatedAt = new Date().toISOString();

        const newProject = await dbInstance.create("projects", projectMeta);
        const newProjectId = newProject.id;
        step++;
        progress();

        const rowIdMap = new Map();

        // 5️⃣ Import datarows (validate IDs)
        if (includeDatarows) {
            const datarowsDir = path.join(tempExtractDir, "datarows");
            if (fs.existsSync(datarowsDir)) {
                const dataProvider = await datarows.getDataProvider();
                const rowFiles = fs
                    .readdirSync(datarowsDir)
                    .filter((f) => f.startsWith("segment_") && f.endsWith(".json"));

                for (const file of rowFiles) {
                    const rows = JSON.parse(fs.readFileSync(path.join(datarowsDir, file), "utf8"));
                    const transformed = rows.map((row) => {
                        let newId = VALID_ID_REGEX.test(row.id) ? row.id : generateId();
                        rowIdMap.set(row.id, newId);

                        return {
                            id: newId,
                            status: row.status ?? false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            data: row.data,
                        };
                    });
                    await dataProvider.bulkCreate(newProjectId, transformed);
                }
            }
        }
        step++;
        progress();

        // 6️⃣ Import outputs (validate IDs & extensions)
        if (includeOutputs) {
            const outputsDir = path.join(tempExtractDir, "outputs");
            if (fs.existsSync(outputsDir)) {
                const outputsDest = path.join(DATA_DIR, "projects", "outputs", newProjectId);
                fs.mkdirSync(outputsDest, { recursive: true });
                for (const file of fs.readdirSync(outputsDir)) {
                    const ext = path.extname(file).toLowerCase();
                    if (!OUTPUT_EXTS.has(ext)) {
                        console.warn(`⚠ Skipping invalid output file: ${file}`);
                        continue;
                    }

                    const baseName = path.parse(file).name;
                    let targetName;
                    if (VALID_ID_REGEX.test(baseName)) {
                        targetName = baseName;
                    } else if (rowIdMap.has(baseName)) {
                        targetName = rowIdMap.get(baseName);
                    } else {
                        targetName = generateId();
                    }

                    fs.copyFileSync(path.join(outputsDir, file), path.join(outputsDest, `${targetName}${ext}`));
                }
            }
        }
        step++;
        progress();

        // 7️⃣ Copy fonts to user-specified dir or desktop
        const fontsSrc = path.join(tempExtractDir, "assets", "fonts");
        if (fs.existsSync(fontsSrc)) {
            let fontsDest;
            if (outputFontsDir) {
                fontsDest = outputFontsDir;
            } else {
                fontsDest = path.join(os.homedir(), "Desktop", `mawj_imported_fonts_${Date.now()}`);
            }
            fs.mkdirSync(fontsDest, { recursive: true });
            for (const file of fs.readdirSync(fontsSrc)) {
                fs.copyFileSync(path.join(fontsSrc, file), path.join(fontsDest, file));
            }
            console.log(`📁 Fonts saved to: ${fontsDest} (install manually if needed)`);
        }
        step++;
        progress();

        await stats.add({
            projectId: newProjectId,
            action: "data_ingestion",
            data: {
                count: 0,
                timeTaken: 0,
            },
        });

        return { success: true, projectId: newProjectId, templateId: newTemplateId };
    } catch (err) {
        console.error("❌ Import Error:", err);
        throw err;
    } finally {
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }
}
