import { runFFmpeg } from "../run.js";

/**
 * Concatenates multiple video segments listed in a text file
 * @param {string} concatFilePath - text file listing segments
 * @param {string} output - output video path
 */
export async function concatSegments(concatFilePath, output) {
    const args = [
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concatFilePath,
        "-c", "copy",
        output
    ];

    await runFFmpeg(args);
}
