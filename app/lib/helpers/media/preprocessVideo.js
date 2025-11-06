import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { hydrateString } from "../../helpers/data/hydrate.js";
import probeMedia from "../../ffmpeg/probe.js";

/**
 * Adjusts video playback speed and optionally applies mirroring or crossfade looping.
 * - Always re-encodes video (even if speed = 1.0).
 * - crossfade overrides mirroring if both are present.
 * - Audio is ignored.
 */
export async function preprocessVideoForBackground(hydratedPath, tmpDir, modifier, row) {
    if (!modifier.options.props.playbackSettings) return hydratedPath;

    const hydratedSettings = hydrateString(row, modifier.options.props.playbackSettings);

    // Extract parameters
    const speedMatch = hydratedSettings.match(/playback_speed\s*:\s*([\d.]+)/);
    const mirrorMatch = hydratedSettings.match(/mirroring\s*:\s*(true|false)/i);
    const crossfadeMatch = hydratedSettings.match(/crossfade\s*:\s*([\d.]+)/);

    const speed = speedMatch ? parseFloat(speedMatch[1]) : 1.0;
    let mirroring = mirrorMatch ? mirrorMatch[1].toLowerCase() === "true" : false;
    const crossfade = crossfadeMatch ? parseFloat(crossfadeMatch[1]) : null;

    // Crossfade overrides mirroring
    if (crossfade) mirroring = false;

    // Prepare filenames
    const baseName = path.basename(hydratedPath, path.extname(hydratedPath));
    const speedPath = path.join(tmpDir, `${baseName}_speed${speed}.mp4`);
    const reversedPath = path.join(tmpDir, `${baseName}_reversed.mp4`);
    const finalPath = path.join(tmpDir, `${baseName}${mirroring ? "_mirror" : crossfade ? "_crossfade" : ""}.mp4`);

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

    // 2️⃣ Crossfade feature (takes precedence over mirroring)
    if (crossfade) {
        const info = await probeMedia(speedPath);
        const duration = parseFloat(info.format.duration);

        const crossfadedPath = path.join(tmpDir, `${baseName}_crossfaded.mp4`);

        // feed same input 3 times
        await runFFmpeg([
            "-y",
            "-i", speedPath,
            "-i", speedPath,
            "-i", speedPath,
            "-filter_complex",
            `[0:v][1:v]xfade=transition=fade:duration=${crossfade}:offset=${duration - crossfade},format=yuv420p[v1];` +
            `[v1][2:v]xfade=transition=fade:duration=${crossfade}:offset=${(duration * 2) - (2 * crossfade)},format=yuv420p[v2]`,
            "-map", "[v2]",
            "-an",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "18",
            "-fflags", "+genpts",
            "-avoid_negative_ts", "make_zero",
            crossfadedPath
        ]);

        const crossfadeInfo = await probeMedia(crossfadedPath);
        const newDuration = parseFloat(crossfadeInfo.format.duration); // precise duration
        const segmentLen = newDuration / 3;

        // extract clean middle third
        await runFFmpeg([
            "-y",
            "-i", crossfadedPath,
            "-ss", segmentLen.toFixed(7),
            "-to", (segmentLen * 2).toFixed(7),
            "-an",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "18",
            finalPath
        ]);

        return finalPath;
    }

    // 3️⃣ Mirroring (if no crossfade)
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

        const concatListPath = path.join(tmpDir, `${baseName}_concat.txt`);
        fs.writeFileSync(concatListPath, `file '${speedPath}'\nfile '${reversedPath}'\n`);

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

    // 4️⃣ Default (only speed adjustment)
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
