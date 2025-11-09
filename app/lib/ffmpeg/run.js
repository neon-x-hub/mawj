import { spawn } from "child_process";

/**
 * Runs an FFmpeg command.
 *
 * @param {string[]} args - The FFmpeg CLI arguments.
 * @param {object} [options] - Optional configuration.
 * @param {boolean} [options.inherit=false] - If true, pipe FFmpeg output to the parent process (console).
 * @param {boolean} [options.silent=false] - If true, suppress logs entirely.
 * @returns {Promise<void>} Resolves when FFmpeg exits with code 0.
 */
export async function runFFmpeg(args, { inherit = false, silent = false } = {}) {
    return new Promise((resolve, reject) => {
        // Determine stdio mode
        const stdio = silent
            ? "ignore"
            : inherit
                ? "inherit"
                : ["ignore", "pipe", "pipe"];

        const ffmpeg = spawn("ffmpeg", args, { stdio });

        let stderr = "";

        // Collect logs only in non-inherit mode
        if (!inherit && !silent && ffmpeg.stderr) {
            ffmpeg.stderr.on("data", (data) => {
                stderr += data.toString();
            });
        }

        ffmpeg.on("error", (err) => reject(err));

        ffmpeg.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                const msg = stderr
                    ? stderr.split("\n").slice(-8).join("\n")
                    : `FFmpeg exited with code ${code}`;
                reject(new Error(msg));
            }
        });
    });
}
