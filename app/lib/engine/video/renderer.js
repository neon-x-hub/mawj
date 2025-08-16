import { spawn } from "child_process";
import path from "path";

function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", args, { stdio: "inherit" });

        ffmpeg.on("error", (err) => reject(err));
        ffmpeg.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`FFmpeg exited with code ${code}`));
        });
    });
}

/**
 * Creates a video by combining an image and audio with ffmpeg.
 * Supports optional GPU encoding, GPU brand selection, and codec choice.
 *
 * @param {string} imagePath - Path to the image file.
 * @param {string} audioPath - Path to the audio file.
 * @param {string} outputPath - Output video file path.
 * @param {Object} [options] - Optional parameters.
 * @param {boolean} [options.useGpu=false] - Whether to use GPU encoding.
 * @param {string} [options.gpuBrand="nvidia"] - GPU brand ("nvidia" for now).
 * @param {string} [options.codec] - Video codec to use: "h264", "h265".
 * @param {string} [options.preset] - Video encoding preset.
 * @param {string} [options.videoBitrate] - Video bitrate.
 * @param {string} [options.audioBitrate] - Audio bitrate.
 */
async function render(imagePath, audioPath, outputPath, options = {}) {
    const {
        useGpu = false,
        gpuBrand = "nvidia",
        codec = "h264",
        preset,
        videoBitrate = "5M",
        audioBitrate = "192k"
    } = options;

    let videoCodec;

    if (useGpu) {
        // GPU encoding logic (currently NVIDIA only)
        if (gpuBrand.toLowerCase() === "nvidia") {
            if (codec === "h264") {
                videoCodec = "h264_nvenc";
            } else if (codec === "h265" || codec === "hevc") {
                videoCodec = "hevc_nvenc";
            } else {
                throw new Error(`Unsupported codec for NVIDIA GPU: ${codec}`);
            }
        } else {
            throw new Error(`GPU brand not supported yet: ${gpuBrand}`);
        }
    } else {
        // CPU encoding
        if (codec === "h264") {
            videoCodec = "libx264";
        } else if (codec === "h265" || codec === "hevc") {
            videoCodec = "libx265";
        } else {
            throw new Error(`Unsupported codec for CPU: ${codec}`);
        }
    }

    const videoPreset = preset ?? (useGpu ? "p4" : "medium");

    const args = [
        "-y",
        "-loop", "1",
        "-i", imagePath,
        "-i", audioPath,
        "-c:v", videoCodec,
        "-preset", videoPreset,
        "-b:v", videoBitrate,
        "-c:a", "aac",
        "-b:a", audioBitrate,
        "-pix_fmt", "yuv420p",
        "-shortest",
        outputPath,
    ];

    try {
        const startTime = Date.now();

        await runFFmpeg(args);

        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Created video: ${outputPath} (Elapsed time: ${elapsedSeconds} seconds)`);
    } catch (error) {
        console.error(`Error creating video for ${path.basename(imagePath)}: ${error.message}`);
    }
}

export { render };
