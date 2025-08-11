import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { render as renderImage } from "../image/renderer.js";
import { render as renderVideo } from "../video/renderer.js";
import datarows from "../../providers/datarows/index.js";
import stats from "../../helpers/stats";
import axios from "axios";
import config from "../../providers/config/index.js";
import { MetadataProvider, revalidators } from "@/app/lib/fam";
import { extractAudioSegment, downloadAudio } from "@/app/lib/audio"


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

    const dataRowsInstance = datarows.getDataProvider();

    const metadataFilePath = `${DATA_DIR}/datarows/${id}/fam.json`;
    const metadata = new MetadataProvider({
        filePath: metadataFilePath,
        revalidators,
        dataRowsInstance
    });
    await metadata.load({ projectId: id });

    const total = rows.length;
    let completed = 0;

    const tmpAudioDir = path.join(DATA_DIR, "projects", "outputs", project.id, "temp_audio");
    const thumbnailDir = path.join(DATA_DIR, "projects", "outputs", project.id, "thumbnails");

    await fs.mkdir(tmpAudioDir, { recursive: true });
    await fs.mkdir(thumbnailDir, { recursive: true });

    const downloadedAudioFiles = [];
    const rowsWithAudio = [];

    // Filter rows & prepare audio paths
    for (const row of rows) {
        const audioVal = row.data?.audio;
        if (!audioVal) continue;

        let audioPath = null;

        try {
            if (audioVal.startsWith("http://") || audioVal.startsWith("https://")) {
                audioPath = await downloadAudio(audioVal, tmpAudioDir);
                if (audioPath) downloadedAudioFiles.push(audioPath);
            } else {
                const resolvedPath = path.isAbsolute(audioVal)
                    ? audioVal
                    : path.join(project.rootPath || __dirname, audioVal);

                if (await fileExists(resolvedPath)) {
                    audioPath = resolvedPath;
                }
            }
        } catch (err) {
            console.warn(`Skipping row ${row.id} due to audio error: ${err.message}`);
            continue;
        }

        if (audioPath) {
            rowsWithAudio.push({ row, audioPath });
        }
    }

    // Bulk render thumbnails for all rows with audio
    if (rowsWithAudio.length > 0) {
        // Extract rows array from objects for bulk thumbnail render
        const rowsOnly = rowsWithAudio.map(({ row }) => row);

        await renderImage(project, template, rowsOnly, { outputDir: thumbnailDir, format: 'jpg' }, () => { });
    }

    // Now iterate rowsWithAudio to render videos individually
    for (const { row, audioPath } of rowsWithAudio) {
        try {
            let finalAudioPath = audioPath;
            let tempTrimmedAudio = null;

            // Audio trimming logic
            if (options.useTrimming && row.data?.from && row.data?.to) {
                const { from, to } = row.data;

                if (isValidTimeFormat(from) && isValidTimeFormat(to)) {
                    try {
                        const trimmedOutputPath = path.join(
                            tmpAudioDir,
                            `trimmed_${row.id}_${path.basename(audioPath)}`
                        );

                        await extractAudioSegment(
                            audioPath,
                            from,
                            to,
                            trimmedOutputPath
                        );

                        finalAudioPath = trimmedOutputPath;
                        tempTrimmedAudio = trimmedOutputPath;
                        downloadedAudioFiles.push(trimmedOutputPath);
                    } catch (trimErr) {
                        console.error(`Audio trimming failed for row ${row.id}: ${trimErr.message}`);
                        // Fall back to original audio
                    }
                } else {
                    console.warn(`Invalid time format for row ${row.id}: from=${from}, to=${to}`);
                }
            }

            const thumbnailPath = path.join(thumbnailDir, `${row.id}.jpg`);
            const outputPath = path.join(DATA_DIR, "projects", "outputs", project.id, `${row.id}.${options.format}`);

            await renderVideo(
                thumbnailPath,
                finalAudioPath,
                outputPath,
                options
            );


            await dataRowsInstance.update(row.id, { status: true });

            let doneCount = metadata.get("doneCount") || 0;
            doneCount = doneCount + 1;
            metadata.set("doneCount", doneCount);

            await metadata.save();

            completed++;
            if (onProgress) {
                const progress = Math.round((completed / rowsWithAudio.length) * 100);
                onProgress(progress);
            }
        } catch (err) {
            console.error(`Error rendering video for row ${row.id}: ${err.message}`);
        }
    }

    // Cleanup downloaded audio files
    for (const filePath of downloadedAudioFiles) {
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.warn(`Failed to delete temp audio file ${filePath}: ${err.message}`);
        }
    }

    // Clean all thumbnail files if !options.keepThumbnails
    if (!options.keepThumbnails) {
        await fs.rm(thumbnailDir, { recursive: true, force: true });
    }

    stats.add({
        projectId: project.id,
        action: "generation",
        data: { timeTaken: Date.now() - jobData.startTime, count: rowsWithAudio.length },
    });

    return rowsWithAudio.length;
}
