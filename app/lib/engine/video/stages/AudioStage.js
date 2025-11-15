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

        let workingAudio = audioPath;

        if (options.useTrimming && row.data?.from && row.data?.to) {
            const { from, to } = row.data;

            if (isValidTimeFormat(from) && isValidTimeFormat(to)) {
                try {
                    const trimmedPath = path.join(
                        tmpAudioDir,
                        `trimmed_${row.id}_${path.basename(audioPath)}`
                    );

                    await extractAudioSegment(workingAudio, from, to, trimmedPath);
                    workingAudio = trimmedPath;
                } catch (err) {
                    this.log(`Trim failed for ${row.id}: ${err.message}`);
                }
            }
        }

        if (options.liveGen === true) {
            try {
                const first10Path = path.join(
                    tmpAudioDir,
                    `livegen_${row.id}_${path.basename(workingAudio)}`
                );

                await extractAudioSegment(workingAudio, "00:00:00.000", "00:00:10.000", first10Path);

                ctx.audioPath = first10Path;
                return;
            } catch (err) {
                this.log(`LiveGen crop failed for ${row.id}: ${err.message}`);
            }
        }

        ctx.audioPath = workingAudio;
    }
}
