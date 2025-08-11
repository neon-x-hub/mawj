import { spawn } from "child_process";

export default async function extractAudioSegment(inputFile, startTime, endTime, outputFile) {
        return new Promise((resolve, reject) => {
            const args = [
                '-y', // Overwrite without asking
                '-ss', startTime,
                '-to', endTime,
                '-i', inputFile,
                '-c', 'copy', // Stream copy (no re-encoding)
                outputFile
            ];

            const ffmpeg = spawn('ffmpeg', args);
            let stderr = '';

            ffmpeg.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
                }
            });

            ffmpeg.on('error', (err) => {
                reject(err);
            });
        });
    }
