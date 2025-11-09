import { runFFmpeg } from "../run.js";
import probeMedia from "../probe.js";

/**
 * Creates a seamless crossfade loop for a video.
 */
export async function applyCrossfadeLoop(inputPath, outputPath, crossfadeDuration) {
    const info = await probeMedia(inputPath);
    const duration = parseFloat(info.format.duration);

    const filterComplex = [
        `[0]split[body][pre];`,
        `[pre]trim=duration=${crossfadeDuration},format=yuva420p,fade=d=${crossfadeDuration}:alpha=1,setpts=PTS+(${duration - crossfadeDuration * 2}/TB)[jt];`,
        `[body]trim=${crossfadeDuration},setpts=PTS-STARTPTS[main];`,
        `[main][jt]overlay`
    ].join("");

    await runFFmpeg([
        "-y",
        "-i", inputPath,
        "-filter_complex", filterComplex,
        "-an",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        outputPath
    ]);
}
