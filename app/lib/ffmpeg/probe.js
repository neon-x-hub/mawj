import { execFile } from "child_process";

/**
 * Probes a media file using ffprobe to extract container and audio/video stream information.
 * Returns a promise that resolves with the parsed JSON output from ffprobe or rejects with an error.
 * @param {string} filePath Path to the media file to probe.
 * @returns {Promise<object>} A promise that resolves with the parsed JSON output from ffprobe or rejects with an error.
 */
function probeMedia(filePath) {
    return new Promise((resolve, reject) => {
        execFile("ffprobe", [
            "-v", "error",               // suppress logs
            "-show_format",              // container info
            "-show_streams",             // audio/video streams info
            "-print_format", "json",     // machine-readable JSON
            filePath
        ], (err, stdout, stderr) => {
            if (err) return reject(err);

            try {
                const info = JSON.parse(stdout);
                resolve(info);
            } catch (parseErr) {
                reject(parseErr);
            }
        });
    });
}

export default probeMedia;
