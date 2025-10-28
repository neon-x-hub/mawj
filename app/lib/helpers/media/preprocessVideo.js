import { spawn } from "child_process";
import path from "path";
import { hydrateString } from "../../helpers/data/hydrate.js";

/**
 * Adjusts video playback speed using ffmpeg.
 * - Ignores audio completely.
 * - Reads "playback_speed: <float>" from modifier.playbackSettings.
 * - Returns path to re-encoded video.
 */
export async function preprocessVideoForBackground(hydratedPath, tmpDir, modifier, row) {
    if (!modifier.playbackSettings) return hydratedPath;

    // Hydrate playback settings using mustache
    const hydratedSettings = hydrateString(row, modifier.playbackSettings);

    // Expect format: "playback_speed: 0.5"
    const match = hydratedSettings.match(/playback_speed\s*:\s*([\d.]+)/);
    if (!match) return hydratedPath;

    const speed = parseFloat(match[1]);
    if (!speed || speed === 1.0) return hydratedPath;

    const outPath = path.join(
        tmpDir,
        `${path.basename(hydratedPath, path.extname(hydratedPath))}_speed${speed}.mp4`
    );

    // For slower playback (<1), increase PTS; for faster (>1), decrease it.
    const setptsExpr = (1 / speed).toFixed(4);

    const args = [
        "-y",
        "-i", hydratedPath,
        "-an", // 🔇 completely drop audio
        "-filter:v", `setpts=${setptsExpr}*PTS`,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        outPath
    ];

    await new Promise((resolve, reject) => {
        const ff = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
        let stderr = "";
        ff.stderr.on("data", d => (stderr += d.toString()));
        ff.on("close", code => {
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg exited ${code}\n${stderr.split("\n").slice(-5).join("\n")}`));
        });
    });

    return outPath;
}
