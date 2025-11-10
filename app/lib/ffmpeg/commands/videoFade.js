import { runFFmpeg } from "../run.js";
import probeMedia from "../probe.js";

/**
 * Applies fade-in and/or fade-out to a video.
 *
 * @param {string} inputPath Path to input video
 * @param {string} outputPath Path to output video
 * @param {object} options
 * @param {number} [options.fadeInDuration] Duration in seconds for fade-in
 * @param {number} [options.fadeOutDuration] Duration in seconds for fade-out
 */
export async function applyVideoFade(inputPath, outputPath, options = {}) {
    const { fadeInDuration = 0, fadeOutDuration = 0 } = options;

    let duration = null;
    if (fadeOutDuration > 0) {
        const info = await probeMedia(inputPath);
        duration = parseFloat(info.format.duration);
        if (isNaN(duration)) throw new Error("Could not determine video duration for fade-out.");
    }

    const filters = [];

    if (fadeInDuration > 0) {
        filters.push(`fade=t=in:st=0:d=${fadeInDuration}`);
    }

    if (fadeOutDuration > 0 && duration !== null) {
        const start = duration - fadeOutDuration;
        filters.push(`fade=t=out:st=${start}:d=${fadeOutDuration}`);
    }

    const filterStr = filters.join(",");

    await runFFmpeg([
        "-y",
        "-i", inputPath,
        "-vf", filterStr,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-c:a", "copy",
        outputPath
    ]);
}
