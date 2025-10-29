import { spawn } from "child_process";
import path from "path";
import { hydrateString } from "../../helpers/data/hydrate.js";

/**
 * Adjusts video playback speed using ffmpeg.
 * - Ignores audio completely.
 * - Reads "playback_speed: <float>" from modifier.playbackSettings.
 * - Uses rendering options (GPU/codec/preset/bitrate) passed in `options`.
 * - Returns path to re-encoded video.
 */
export async function preprocessVideoForBackground(hydratedPath, tmpDir, modifier, row, options = {}) {
    if (!modifier.playbackSettings) return hydratedPath;

    // Hydrate playback settings using mustache
    const hydratedSettings = hydrateString(row, modifier.playbackSettings);

    // Expect format like: "playback_speed: 0.5"
    const match = hydratedSettings.match(/playback_speed\s*:\s*([\d.]+)/);
    if (!match) return hydratedPath;

    const speed = parseFloat(match[1]);
    if (!speed || speed === 1.0) return hydratedPath;

    const outPath = path.join(
        tmpDir,
        `${path.basename(hydratedPath, path.extname(hydratedPath))}_speed${speed}.mp4`
    );

    // Extract options with sensible defaults
    const {
        useGpu = false,
        gpuBrand = "nvidia",
        codec = "h264",
        preset,
        videoBitrate = "5M"
    } = options;

    // Pick the right video codec
    let videoCodec;
    if (useGpu) {
        if (gpuBrand.toLowerCase() === "nvidia") {
            if (codec === "h264") videoCodec = "h264_nvenc";
            else if (codec === "h265" || codec === "hevc") videoCodec = "hevc_nvenc";
            else throw new Error(`Unsupported codec for NVIDIA GPU: ${codec}`);
        } else {
            throw new Error(`GPU brand not supported yet: ${gpuBrand}`);
        }
    } else {
        if (codec === "h264") videoCodec = "libx264";
        else if (codec === "h265" || codec === "hevc") videoCodec = "libx265";
        else throw new Error(`Unsupported codec for CPU: ${codec}`);
    }

    const videoPreset = preset ?? (useGpu ? "p4" : "medium");

    // For slower playback (<1), increase PTS; for faster (>1), decrease it
    const setptsExpr = (1 / speed).toFixed(4);

    const args = [
        "-y",
        "-i", hydratedPath,
        "-an",
        "-filter:v", `setpts=${setptsExpr}*PTS`,
        "-c:v", videoCodec,
        "-preset", videoPreset,
        "-b:v", videoBitrate,
        "-pix_fmt", "yuv420p",
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
