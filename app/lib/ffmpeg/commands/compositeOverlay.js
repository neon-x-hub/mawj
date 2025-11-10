import { spawn } from "child_process";

export default async function compositeOverlayOntoVideo({
    bgVideoPath,       // original video path (finalContent)
    overlayImagePath,  // generated hollow PNG
    outPath,           // where to write composite video
    position = "center" // 'center' or 'top-left' (you can expand)
}) {
    // choose overlay position expression
    const overlayExpr =
        position === "top-left"
            ? "0:0"
            : "(main_w-overlay_w)/2:(main_h-overlay_h)/2";

    return new Promise((resolve, reject) => {
        // ffmpeg -i bgVideo -i overlay.png -filter_complex "overlay=...:format=auto" -c:a copy -c:v libx264 -crf 18 -preset veryfast -y outPath
        const args = [
            "-y",
            "-i", bgVideoPath,
            "-i", overlayImagePath,
            "-filter_complex", `overlay=${overlayExpr}:format=auto`,
            "-c:v", "libx264",
            "-crf", "18",
            "-preset", "veryfast",
            "-c:a", "copy",
            outPath
        ];

        const ff = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });

        let stderr = "";
        ff.stderr.on("data", (d) => (stderr += d.toString()));
        ff.on("error", (err) => reject(err));
        ff.on("close", (code) => {
            if (code === 0) return resolve(outPath);
            const err = new Error(`ffmpeg exited ${code}: ${stderr.split("\n").slice(-5).join("\n")}`);
            reject(err);
        });
    });
}
