import path from "path";
import { isImage, isVideo, fileExists } from "../../helpers/media/check.js";
import { hydrateString } from "../../helpers/data/hydrate.js";
import { createTransparentImage } from "../../helpers/images/createTransparentImage.js";
import compositeOverlayOntoVideo from "../../ffmpeg/compositeOverlay.js";
import { preprocessVideoForBackground } from "../../helpers/media/preprocessVideo.js";
import { render as renderImage } from "../../engine/image/renderer.js";

export async function processBgCtrl({ row, project, template, modifier, tmpDir, options }) {
    const hydratedPath = hydrateString(row, modifier.options.props.template);
    if (!(await fileExists(hydratedPath))) return null;

    const baseLayer = template.baseLayers?.[0] || {};
    const width = baseLayer.width;
    const height = baseLayer.height;

    // image background
    if (isImage(hydratedPath)) {
        const { output } = await renderImage(
            project,
            template,
            [row],
            { outputDir: tmpDir, format: "png", baseLayer: hydratedPath },
            () => { }
        );
        return output;
    }

    // video background
    if (isVideo(hydratedPath)) {
        const preprocessedVideoPath = await preprocessVideoForBackground(hydratedPath, tmpDir, modifier, row);
        const transparentPath = path.join(tmpDir, `${row.id}_blank.png`);
        await createTransparentImage({ width, height, outPath: transparentPath });

        let output = await renderImage(
            project,
            template,
            [row],
            { outputDir: tmpDir, format: "png", baseLayer: transparentPath },
            () => { }
        );

        output = output[0].output;

        const compositePath = path.join(tmpDir, `${row.id}_composite.mp4`);
        await compositeOverlayOntoVideo({
            bgVideoPath: preprocessedVideoPath,
            overlayImagePath: output,
            outPath: compositePath
        });

        return compositePath;
    }

    return null;
}
