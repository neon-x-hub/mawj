import { runFFmpeg } from "../run.js";

/**
 * Adjusts playback speed (always re-encodes).
 */
export async function adjustVideoSpeed(inputPath, outputPath, speed) {
    const setptsExpr = (1 / speed).toFixed(4);
    await runFFmpeg([
        "-y",
        "-i", inputPath,
        "-an",
        "-filter:v", `setpts=${setptsExpr}*PTS`,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        outputPath
    ]);
}
