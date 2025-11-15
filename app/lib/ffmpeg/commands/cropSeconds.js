import { runFFmpeg } from "../run.js";

/**
 * Crops the first N seconds of an audio file.
 */
export async function cropAudio(inputPath, outputPath, seconds) {
    await runFFmpeg([
        "-y",
        "-i", inputPath,
        "-t", seconds.toString(),   // duration to keep
        "-c:a", "copy",             // copy audio codec (no re-encode)
        outputPath
    ]);
}
