import fs from "fs/promises";
import path from "path";
import { Stage } from "./Stage.js";
import { extractAudioSegment, downloadAudio } from "@/app/lib/audio";

function isValidTimeFormat(timeStr) {
    return /^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(timeStr);
}

async function fileExists(filePath) {
    try { await fs.access(filePath); return true; } catch { return false; }
}

export class AudioStage extends Stage {
    constructor() {
        super("AudioStage");
    }

    async run(ctx) {
        const { currentRow: row, dataDir, options } = ctx;
        const audioVal = row.data?.audio;
        if (!audioVal) return;

        const tmpAudioDir = ctx.tmpDirs.audio;
        let audioPath = null;

        try {
            // download or resolve
            if (audioVal.startsWith("http://") || audioVal.startsWith("https://")) {
                audioPath = await downloadAudio(audioVal, tmpAudioDir);
            } else {
                const resolvedPath = path.isAbsolute(audioVal)
                    ? audioVal
                    : path.join(dataDir, audioVal);

                if (await fileExists(resolvedPath)) audioPath = resolvedPath;
            }
        } catch (err) {
            this.log(`Skipping row ${row.id} (audio error: ${err.message})`);
            return;
        }

        if (!audioPath) return;

        // trimming
        if (options.useTrimming && row.data?.from && row.data?.to) {
            const { from, to } = row.data;
            if (isValidTimeFormat(from) && isValidTimeFormat(to)) {
                try {
                    const trimmedOutputPath = path.join(
                        tmpAudioDir,
                        `trimmed_${row.id}_${path.basename(audioPath)}`
                    );
                    await extractAudioSegment(audioPath, from, to, trimmedOutputPath);
                    ctx.audioPath = trimmedOutputPath;
                    return;
                } catch (trimErr) {
                    this.log(`Trim failed for ${row.id}: ${trimErr.message}`);
                }
            }
        }

        ctx.audioPath = audioPath;
    }
}
