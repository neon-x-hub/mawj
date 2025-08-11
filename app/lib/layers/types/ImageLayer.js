import Layer from './AbstractLayer';
import { IMAGE_DEFAULTS } from '../../defaults';
import { ImagePropertiesPanel } from '../../../components/core/menu/ImageEditPanel';


class ImageLayer extends Layer {
    constructor({ id, title, subtitle, options = {}, canvas = null }) {
        super(id, 'image', title, subtitle, options);
        this.icon = options.icon || '/icons/coco/line/Gallery.svg';
        this.props = {
            ...IMAGE_DEFAULTS,
            ...options.props
        };
        this.canvas = canvas;
    }

    buildTransform({ rotation, skewX, skewY }) {
        const transforms = [];

        if (rotation) transforms.push(`rotate(${rotation})`);
        if (skewX) transforms.push(`skewX(${skewX}deg)`);
        if (skewY) transforms.push(`skewY(${skewY}deg)`);

        return transforms.join(' ');
    }

    buildStyle() {

        const {
            rotation,
            skewX,
            skewY,
            left,
            top,
            content,
            templateText,
            ...styleProps
        } = this.props;

        const transformParts = [this.buildTransform({ rotation, skewX, skewY })];
        if (left && /%$/.test(left)) transformParts.push('translateX(-50%)');
        if (top && /%$/.test(top)) transformParts.push('translateY(-50%)');

        const baseStyle = {
            ...styleProps,
            left,
            top,
            display: 'flex',
            transform: transformParts.filter(Boolean).join(' '),
            transformOrigin: 'center center',
        };

        return { style: baseStyle };

    }


    renderContent({ node_key }) {
        // Actual rendering would go here
        const { style } = this.buildStyle();
        const { content } = this.props;

        return <img
            key={node_key}
            alt={this.props.alt || 'Image'}
            src={content || 'http://localhost:3000/placeholder/placeholder-image.webp'}
            style={style}
        >
        </img>;
    }

    renderPreview() {
        const { style } = this.buildStyle();
        const { content } = this.props;

        const previewStyle = {
            ...style,
            position: 'relative',
            overflow: 'auto',
            top: 'auto',
            left: 'auto',
        }

        return <img
            alt={this.props.alt || 'Image'}
            src={content || 'http://localhost:3000/placeholder/placeholder-image.webp'}
            style={previewStyle}
        >
        </img>;
    }

    renderPropertiesPanel(onChange) {
        return (
            <div className="max-w-full overflow-auto">
                <ImagePropertiesPanel
                    value={this.props}
                    onChange={onChange}
                />
            </div>
        );
    }

    updateProps(newProps) {
        this.props = { ...this.props, ...newProps };
        return this;
    }

    clone() {
        return new ImageLayer({
            id: this.id,
            title: this.title,
            subtitle: this.subtitle,
            options: {
                icon: this.icon,
                props: { ...this.props }
            },
            canvas: this.canvas
        });
    }
}

export default ImageLayer;
