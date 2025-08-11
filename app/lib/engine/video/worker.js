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

const DATA_DIR = await config.get('baseFolder') || './data';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Downloads an audio file from a URL and saves it to a directory.
 * @param {string} url - URL to download from
 * @param {string} downloadDir - Directory to save the file to
 * @returns {Promise<string|null>} A promise that resolves to the path of the downloaded file, or null if there was an error.
 */
async function downloadAudio(url, downloadDir) {
    try {
        const fileName = path.basename(new URL(url).pathname);
        const destPath = path.join(downloadDir, fileName);

        // Use fsSync for createWriteStream
        const writer = fsSync.createWriteStream(destPath);

        const response = await axios({
            method: "get",
            url,
            responseType: "stream",
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        return destPath;
    } catch (err) {
        console.error(`Error downloading audio from ${url}: ${err.message}`);
        return null;
    }
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function workerVideoRenderer(jobData, onProgress) {
    const { project, template, rows, options } = jobData;
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
            const thumbnailPath = path.join(thumbnailDir, `${row.id}.jpg`);
            const outputPath = path.join(DATA_DIR, "projects", "outputs", project.id, `${row.id}.${options.format}`);

            await renderVideo(
                thumbnailPath,
                audioPath,
                outputPath,
                options
            );

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
        // import fs from 'fs/promises'
        await fs.rm(thumbnailDir, { recursive: true, force: true });
    }

    stats.add({
        projectId: project.id,
        action: "generation",
        data: { timeTaken: Date.now() - jobData.startTime, count: rowsWithAudio.length },
    });

    return rowsWithAudio.length;
}
