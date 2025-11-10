import path from "path";
import { isImage } from "../../helpers/media/check.js";
import { runFFmpeg } from "../../ffmpeg/run.js";
import probeMedia from "../../ffmpeg/probe.js";

/**
 * Creates a video by combining a background (image or video) with audio.
 * Supports optional GPU encoding, GPU brand selection, codec choice, and fade-in/out.
 *
 * @param {string} bgPath - Path to the image or video file.
 * @param {string} audioPath - Path to the audio file.
 * @param {string} outputPath - Output video file path.
 * @param {Object} [options] - Optional parameters.
 * @param {boolean} [options.useGpu=false] - Whether to use GPU encoding.
 * @param {string} [options.gpuBrand="nvidia"] - GPU brand ("nvidia" for now).
 * @param {string} [options.codec="h264"] - Video codec to use: "h264", "h265".
 * @param {string} [options.preset] - Video encoding preset.
 * @param {string} [options.videoBitrate="5M"] - Video bitrate.
 * @param {string} [options.audioBitrate="192k"] - Audio bitrate.
 * @param {number} [options.fadeInDuration=0] - Fade-in duration in seconds.
 * @param {number} [options.fadeOutDuration=0] - Fade-out duration in seconds.
 */
async function render(bgPath, audioPath, outputPath, options = {}) {
    const {
        useGpu = false,
        gpuBrand = "nvidia",
        codec = "h264",
        preset,
        videoBitrate = "5M",
        audioBitrate = "192k",
        fadeInDuration = 0,
        fadeOutDuration = 0
    } = options;

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
    const isImageBg = isImage(bgPath);

    // --- Probe audio duration if fade-out is needed ---
    let audioDuration = 0;
    if (fadeOutDuration > 0) {
        const info = await probeMedia(audioPath);
        audioDuration = parseFloat(info.format.duration);
        if (isNaN(audioDuration)) throw new Error("Cannot determine audio duration for fade-out");
    }

    // --- Build FFmpeg args ---
    const args = [
        "-y",
        ...(isImageBg ? ["-loop", "1", "-i", bgPath] : ["-stream_loop", "-1", "-i", bgPath]),
        "-i", audioPath,
        "-c:v", videoCodec,
        "-preset", videoPreset,
        "-b:v", videoBitrate,
        "-c:a", "aac",
        "-b:a", audioBitrate,
        "-pix_fmt", "yuv420p",
        "-shortest" // stop at audio end
    ];

    // --- Add fade filters ---
    const fadeFilters = [];
    if (fadeInDuration > 0) fadeFilters.push(`fade=t=in:st=0:d=${fadeInDuration}`);
    if (fadeOutDuration > 0) fadeFilters.push(`fade=t=out:st=${audioDuration - fadeOutDuration}:d=${fadeOutDuration}`);
    if (fadeFilters.length > 0) args.push("-vf", fadeFilters.join(","));

    args.push(outputPath);

    // --- Run FFmpeg ---
    try {
        const startTime = Date.now();
        await runFFmpeg(args, { inherit: true });
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Created video: ${outputPath} (Elapsed time: ${elapsedSeconds} seconds)`);
    } catch (error) {
        console.error(`Error creating video for ${path.basename(bgPath)}: ${error.message}`);
    }
}

export { render };
