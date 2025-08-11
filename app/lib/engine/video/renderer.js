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
 * Supports optional GPU encoding and codec choice.
 *
 * @param {string} imagePath - Path to the image file.
 * @param {string} audioPath - Path to the audio file.
 * @param {string} outputPath - Output video file path.
 * @param {Object} [options] - Optional parameters.
 * @param {boolean} [options.useGpu=false] - Whether to use NVIDIA GPU encoding.
 * @param {string} [options.codec] - Video codec to use (overrides default based on GPU).
 * @param {string} [options.preset] - Video encoding preset.
 * @param {string} [options.videoBitrate] - Video bitrate.
 * @param {string} [options.audioBitrate] - Audio bitrate.
 */
async function render(imagePath, audioPath, outputPath, options = {}) {
    const {
        useGpu = false,
        codec,
        preset,
        videoBitrate = "5M",
        audioBitrate = "192k",
    } = options;

    // Decide codec
    let videoCodec = codec;
    if (!videoCodec) {
        videoCodec = useGpu ? "h264_nvenc" : "libx264";
    }

    // Default preset for GPU vs CPU if not specified
    const videoPreset = preset ?? (useGpu ? "p4" : "medium");

    const args = [
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
        console.log(`Creating video for: ${imagePath} with codec ${videoCodec}...`);
        const startTime = Date.now();

        await runFFmpeg(args);

        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Created video: ${outputPath} (Elapsed time: ${elapsedSeconds} seconds)`);
    } catch (error) {
        console.error(`Error creating video for ${path.basename(imagePath)}: ${error.message}`);
    }
}

export { render };
