import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { hydrateString } from "../../helpers/data/hydrate.js";

/**
 * Adjusts video playback speed and optionally applies mirroring.
 * - Always re-encodes video (even if speed = 1.0).
 * - If `mirroring: true`, concatenates the reversed version after playback.
 * - Audio is ignored.
 */
export async function preprocessVideoForBackground(hydratedPath, tmpDir, modifier, row) {
    if (!modifier.options.props.playbackSettings) return hydratedPath;

    const hydratedSettings = hydrateString(row, modifier.options.props.playbackSettings);

    const speedMatch = hydratedSettings.match(/playback_speed\s*:\s*([\d.]+)/);
    const mirrorMatch = hydratedSettings.match(/mirroring\s*:\s*(true|false)/i);

    const speed = speedMatch ? parseFloat(speedMatch[1]) : 1.0;
    const mirroring = mirrorMatch ? mirrorMatch[1].toLowerCase() === "true" : false;

    // Prepare filenames
    const baseName = path.basename(hydratedPath, path.extname(hydratedPath));
    const speedPath = path.join(tmpDir, `${baseName}_speed${speed}.mp4`);
    const reversedPath = path.join(tmpDir, `${baseName}_reversed.mp4`);
    const concatListPath = path.join(tmpDir, `${baseName}_concat.txt`);
    const finalPath = path.join(tmpDir, `${baseName}${mirroring ? "_mirror" : ""}.mp4`);

    // 1️⃣ Always process playback speed (even if 1.0)
    const setptsExpr = (1 / speed).toFixed(4);
    await runFFmpeg([
        "-y",
        "-i", hydratedPath,
        "-an",
        "-filter:v", `setpts=${setptsExpr}*PTS`,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        speedPath
    ]);

    // 2️⃣ If mirroring, create reversed version
    if (mirroring) {
        await runFFmpeg([
            "-y",
            "-i", speedPath,
            "-an",
            "-filter:v", "reverse",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "18",
            reversedPath
        ]);

        // 3️⃣ Create concat list file
        fs.writeFileSync(concatListPath, `file '${speedPath}'\nfile '${reversedPath}'\n`);

        // 4️⃣ Concatenate both
        await runFFmpeg([
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concatListPath,
            "-c:v", "copy",
            finalPath
        ]);

        return finalPath;
    }

    // If no mirroring, return speed-adjusted version
    return speedPath;
}

/**
 * Helper to run ffmpeg command with promise
 */
async function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
        const ff = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
        let stderr = "";
        ff.stderr.on("data", d => (stderr += d.toString()));
        ff.on("close", code => {
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg exited ${code}\n${stderr.split("\n").slice(-8).join("\n")}`));
        });
    });
}
