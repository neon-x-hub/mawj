import path from "path";
import { render } from "../../engine/image/renderer";

export async function generatePreview(template) {
    // Clone and modify the template
    const previewTemplate = {
        ...template,
        layers: template.layers.map(layer => ({
            ...layer,
            options: {
                ...layer.options,
                props: {
                    ...layer.options?.props,
                    templateText: false
                }
            }
        }))
    };

    await render(
        { "a": "b" },
        previewTemplate,
        [{ 'a': 'b' }],
        {
            format: 'jpg',
            outputName: 'preview.jpg',
            outputDir: path.resolve(`./data/templates/${template.id}/previews`),
        }
    );
}
