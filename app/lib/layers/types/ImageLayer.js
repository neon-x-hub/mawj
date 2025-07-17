import Layer from './AbstractLayer';
import { IMAGE_DEFAULTS } from "@/app/lib/defaults";

class ImageLayer extends Layer {
    constructor({ id, title, subtitle, options = {}, canvas = null }) {
        super(id, 'image', title, subtitle, options);
        this.icon = options.icon || '/icons/coco/line/Gallery.svg';
        this.imageProps = {
            ...IMAGE_DEFAULTS,
            ...options.imageProps
        };
        this.canvas = canvas;
    }

    renderContent() {
        // Actual rendering would go here
        return <img alt={this.imageProps.alt || 'Image'} src={`https://placehold.co/${this.imageProps.width}x${this.imageProps.height}/png`} width={this.imageProps.width} height={this.imageProps.height}>
        </img>; // Placeholder for now
    }

    renderPreview() {
        return null
    }

    renderPropertiesPanel(onChange) {
        return (
            <div className="p-4">
                <p>Image Properties Panel (to be implemented)</p>
                {/* Actual image properties editing would go here */}
            </div>
        );
    }

    updateProps(newProps) {
        this.imageProps = { ...this.imageProps, ...newProps };
        return this;
    }

    clone() {
        return new ImageLayer({
            id: this.id,
            title: this.title,
            subtitle: this.subtitle,
            options: {
                icon: this.icon,
                imageProps: { ...this.imageProps }
            },
            canvas: this.canvas
        });
    }
}

export default ImageLayer;
