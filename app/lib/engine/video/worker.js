import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { render as renderImage } from "../image/renderer.js";
import { render as renderVideo } from "../video/renderer.js";
import datarows from "../../providers/datarows/index.js";
import stats from "../../helpers/stats";
import config from "../../providers/config/index.js";
import { MetadataProvider, revalidators } from "@/app/lib/fam";
import { extractAudioSegment, downloadAudio } from "@/app/lib/audio"
import modifierHandlers from "../../modifiers/handlers/";


const DATA_DIR = await config.get('baseFolder') || './data';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function isValidTimeFormat(timeStr) {
    return /^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(timeStr);
}

export async function workerVideoRenderer(jobData, onProgress) {
    const { project, template, rows, options } = jobData;

    const dataRowsInstance = await datarows.getDataProvider();

    // --- Metadata setup ---
    const metadataFilePath = `${DATA_DIR}/datarows/${project.id}/fam.json`;
    const metadata = new MetadataProvider({
        filePath: metadataFilePath,
        revalidators,
        provider: dataRowsInstance
    });
    await metadata.load({ projectId: project.id });
    // ----------------------

    const tmpAudioDir = path.join(DATA_DIR, "projects", "outputs", project.id, "temp_audio");
    const tempBgDir = path.join(DATA_DIR, "projects", "outputs", project.id, "temp_bg");
    const thumbnailDir = path.join(DATA_DIR, "projects", "outputs", project.id, "thumbnails");

    await fs.mkdir(tmpAudioDir, { recursive: true });
    await fs.mkdir(tempBgDir, { recursive: true });
    await fs.mkdir(thumbnailDir, { recursive: true });

    let completed = 0;
    let processedCount = 0;

    for (const row of rows) {
        const audioVal = row.data?.audio;
        if (!audioVal) continue;

        let audioPath = null;
        try {
            // Download or resolve audio path
            if (audioVal.startsWith("http://") || audioVal.startsWith("https://")) {
                audioPath = await downloadAudio(audioVal, tmpAudioDir);
            } else {
                const resolvedPath = path.isAbsolute(audioVal)
                    ? audioVal
                    : path.join(DATA_DIR, audioVal);

                if (await fileExists(resolvedPath)) {
                    audioPath = resolvedPath;
                }
            }
        } catch (err) {
            console.warn(`Skipping row ${row.id} due to audio error: ${err.message}`);
            continue;
        }

        if (!audioPath) continue;

        try {
            // Render thumbnail (per row now instead of bulk)
            let thumbnailPath = null;

            const bgModifier = (template.modifiers || []).find(m => m.type === "bgctrl");

            if (bgModifier) {
                try {
                    thumbnailPath = await modifierHandlers["bgctrl"]({
                        row,
                        project,
                        template,
                        modifier: bgModifier,
                        tmpDir: tempBgDir,
                        options
                    });
                } catch (err) {
                    console.warn(`bgctrl failed for row ${row.id}:`, err.message);
                }
            }

            // fallback if no valid bgctrl path
            if (!thumbnailPath) {
                const out = await renderImage(
                    project,
                    template,
                    [row],
                    { outputDir: path.join(DATA_DIR, "projects", "outputs", project.id, "thumbnails"), format: "png" },
                    () => { }
                );
                thumbnailPath = out.output;
            }

            let finalAudioPath = audioPath;
            let tempTrimmedAudio = null;

            // --- Audio trimming ---
            if (options.useTrimming && row.data?.from && row.data?.to) {
                const { from, to } = row.data;

                if (isValidTimeFormat(from) && isValidTimeFormat(to)) {
                    try {
                        const trimmedOutputPath = path.join(
                            tmpAudioDir,
                            `trimmed_${row.id}_${path.basename(audioPath)}`
                        );

                        await extractAudioSegment(audioPath, from, to, trimmedOutputPath);

                        finalAudioPath = trimmedOutputPath;
                        tempTrimmedAudio = trimmedOutputPath;
                    } catch (trimErr) {
                        console.error(`Audio trimming failed for row ${row.id}: ${trimErr.message}`);
                        // fallback to original
                    }
                } else {
                    console.warn(`Invalid time format for row ${row.id}: from=${from}, to=${to}`);
                }
            }
            // ----------------------

            // Render video
            const outputPath = path.join(
                DATA_DIR,
                "projects",
                "outputs",
                project.id,
                `${row.id}.${options.format}`
            );

            console.log("Rendeing video with thumbnail path: ", thumbnailPath);


            await renderVideo(thumbnailPath, finalAudioPath, outputPath, options);

            console.log("Setting row as done: ", row.id);
            await dataRowsInstance.update(project.id, row.id, { status: true });

            let doneCount = metadata.get("doneCount") || 0;
            doneCount = doneCount + 1;
            metadata.set("doneCount", doneCount);
            await metadata.save();

            completed++;
            processedCount++;

            if (onProgress) {
                const progress = Math.round((processedCount / rows.length) * 100);
                onProgress(progress);
            }
        } catch (err) {
            console.error(`Error rendering video for row ${row.id}: ${err.message}`);
        } finally {
            // cleanup downloaded audio (even if error)
            if (audioVal.startsWith("http://") || audioVal.startsWith("https://")) {
                try {
                    await fs.unlink(audioPath);
                } catch (err) {
                    console.warn(`Failed to delete temp audio file ${audioPath}: ${err.message}`);
                }
            }
        }
    }

    // Clean thumbnails if not needed
    if (!options.keepThumbnails) {
        await fs.rm(thumbnailDir, { recursive: true, force: true });
    }

    try {
        await fs.rm(tempBgDir, { recursive: true, force: true });
    } catch (err) {
        console.warn(`⚠️ Failed to clear tempBgDir (${tempBgDir}): ${err.message}`);
    }

    stats.add({
        projectId: project.id,
        action: "generation",
        data: { timeTaken: Date.now() - jobData.startTime, count: completed },
    });

    console.log("Done rendering all videos");

    return completed;
}
