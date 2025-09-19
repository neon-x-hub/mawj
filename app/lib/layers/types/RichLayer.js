import DOMPurify from 'dompurify';
import Layer from './AbstractLayer';

class RichLayer extends Layer {
    constructor({ id, title, subtitle, options = {}, canvas }) {
        super(id, 'richtext', title, subtitle, options);
        this.icon = options.icon || '/icons/coco/line/Programming.svg';
        this.props = {
            content: '',
            ...options.props
        };
        this.canvas = canvas;
    }

    buildStyle() {
        const { style } = super.buildStyle ? super.buildStyle() : { style: {} };
        return { style };
    }

    renderContent({ node_key }) {
        const { content } = this.props;
        const safeHTML = DOMPurify.sanitize(content || '');

        return (
            <div
                key={node_key}
                id={`richtext-layer-${this.id}`}
                style={this.buildStyle().style}
                dangerouslySetInnerHTML={{ __html: safeHTML }}
            />
        );
    }

    renderPreview(onChange) {
        const { content } = this.props;

        const handleChange = (e) => {
            const newValue = e.target.value;
            if (typeof onChange === 'function') {
                onChange({ content: newValue });
            }
        };

        return (
            <textarea
                style={{ width: '100%', height: '100%' }}
                value={content}
                onChange={handleChange}
            />
        );
    }

    updateProps(newProps) {
        this.props = { ...this.props, ...newProps };
        return this;
    }
}

export default RichLayer;
