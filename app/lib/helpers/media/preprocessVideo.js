import path from "path";
import { hydrateString } from "../../helpers/data/hydrate.js";
import { adjustVideoSpeed } from "../../ffmpeg/commands/adjustSpeed.js";
import { applyCrossfadeLoop } from "../../ffmpeg/commands/crossfadeLoop.js";
import { applyMirrorLoop } from "../../ffmpeg/commands/mirrorLoop.js";
import { parsePlaybackSettings } from "../data/parsePlaybackSettings.js";

/**
 * Adjusts video playback speed and optionally applies mirroring or crossfade looping.
 * - Always re-encodes video (even if speed = 1.0).
 * - crossfade overrides mirroring if both are present.
 * - Audio is ignored.
 */
export async function preprocessVideoForBackground(hydratedPath, tmpDir, modifier, row) {
    if (!modifier.options.props.playbackSettings) return hydratedPath;

    const hydratedSettings = hydrateString(row, modifier.options.props.playbackSettings);

    let { speed, mirroring, crossfade } = parsePlaybackSettings(hydratedSettings);

    // Crossfade overrides mirroring
    if (crossfade) mirroring = false;

    // Prepare filenames
    const baseName = path.basename(hydratedPath, path.extname(hydratedPath));
    const speedPath = path.join(tmpDir, `${baseName}_speed${speed}.mp4`);
    const finalPath = path.join(tmpDir, `${baseName}${mirroring ? "_mirror" : crossfade ? "_crossfade" : ""}.mp4`);

    await adjustVideoSpeed(hydratedPath, speedPath, speed);

    if (crossfade) {
        await applyCrossfadeLoop(speedPath, finalPath, crossfade);
        return finalPath;
    }

    if (mirroring) {
        await applyMirrorLoop(speedPath, tmpDir, baseName, finalPath);
        return finalPath;
    }

    return speedPath;
}
