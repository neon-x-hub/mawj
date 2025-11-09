import fs from "fs";
import path from "path";
import { runFFmpeg } from "../run.js";

/**
 * Creates a mirrored (forward + reversed) loop.
 */
export async function applyMirrorLoop(inputPath, tmpDir, baseName, outputPath) {
    const reversedPath = path.join(tmpDir, `${baseName}_reversed.mp4`);
    const concatListPath = path.join(tmpDir, `${baseName}_concat.txt`);

    // Generate reversed copy
    await runFFmpeg([
        "-y",
        "-i", inputPath,
        "-an",
        "-filter:v", "reverse",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        reversedPath
    ]);

    // Create concat list file
    fs.writeFileSync(concatListPath, `file '${inputPath}'\nfile '${reversedPath}'\n`);

    // Concatenate forward + reversed
    await runFFmpeg([
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concatListPath,
        "-c:v", "copy",
        outputPath
    ]);
}
