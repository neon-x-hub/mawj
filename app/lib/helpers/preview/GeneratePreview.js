import path from "path";
import { workerRenderer } from "../../engine/image/worker";
import { workerVideoRenderer } from "../../engine/video/worker";
import config from "../../providers/config";

export async function generateCardPreview(project, template, row, options = {}) {
    // Clone and modify the template
    const previewTemplate = {
        ...template,
        layers: template.layers.map(layer => ({
            ...layer,
            options: {
                ...layer.options,
                props: {
                    ...layer.options?.props,
                    templateText: options.liveGen ? layer.options?.props?.templateText : false,
                }
            }
        }))
    };

    await workerRenderer({
        project,
        template: previewTemplate,
        rows: row ? [row] : [{"a": "b"}],
        options: {
            ...options,
            format: options.format || 'jpg',
            outputName: options.outputName || `preview.jpg`,
            outputDir: options.outputDir || path.resolve(`${await config.get('baseFolder') || './data'}/templates/${template.id}/previews`),
        }
    });
}

export async function generateVideoPreview(project, template, row, options = {}) {
    // Clone and modify the template
    const previewTemplate = {
        ...template,
        layers: template.layers.map(layer => ({
            ...layer,
            options: {
                ...layer.options,
                props: {
                    ...layer.options?.props,
                    templateText: options.liveGen ? layer.options?.props?.templateText : false,
                }
            }
        }))
    };

    await workerVideoRenderer({
        project,
        template: previewTemplate,
        rows: [row],
        options: {
            ...options,
            outputName: options.outputName || `preview.mp4`,
            outputDir: options.outputDir || path.resolve(`${await config.get('baseFolder') || './data'}/templates/${template.id}/previews`),
        }
    });
}
