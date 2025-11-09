export function parsePlaybackSettings(settingsString) {
    const speed = parseFloat(settingsString.match(/playback_speed\s*:\s*([\d.]+)/)?.[1] || "1.0");
    const mirroring = /mirroring\s*:\s*true/i.test(settingsString);
    const crossfade = parseFloat(settingsString.match(/crossfade\s*:\s*([\d.]+)/)?.[1] || "0");

    return { speed, mirroring, crossfade: crossfade || null };
}
