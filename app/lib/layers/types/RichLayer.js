import * as sanitizeHtml from 'sanitize-html';
import Layer from './AbstractLayer';
import RichPropertiesPanel from '@/app/components/core/menu/RichEditPanel';
import { direction } from 'direction';
import s4 from '../../helpers/html/s4';

class RichLayer extends Layer {
    constructor({ id, title, subtitle, options = {}, canvas }) {
        super(id, 'rich', title, subtitle, options);
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

    renderContent({ node_key, ssrh = false }) {
        const { content } = this.props;
        let safeHTML = sanitizeHtml(content, {
            allowedTags: [
                'style', 'img', 'h1', 'h2', 'span', 'div',
                'br', 'p', 'a', 'ul', 'ol', 'li', 'table',
                'thead', 'tbody', 'tr', 'th', 'td'
            ],
            allowedAttributes: {
                '*': ['style', 'class', 'id'],
                'style': ['type']
            },
            allowVulnerableTags: true,
            allowedSchemes: ['http', 'https', 'data'],
            nonTextTags: []
        });

        safeHTML = s4(safeHTML, `rich-layer-${this.id}`);

        if (ssrh) {
            return safeHTML;
        }

        return (
            <div
                key={node_key}
                id={`rich-layer-${this.id}`}
                style={this.buildStyle().style}
                dangerouslySetInnerHTML={{ __html: safeHTML }}
            />
        );
    }

    renderPreview(onChange) {
        const { content } = this.props;
        const { style } = this.buildStyle();


        const textareaStyle = {
            ...style,
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'auto',
            top: 'auto',
            left: 'auto',
            transform: 'none',
            direction: 'ltr'
        }
        const handleChange = (e) => {
            const newContent = e.target.value;
            this.props.content = newContent; // still update internal state
            if (typeof onChange === 'function') {
                onChange({ content: newContent }); // notify parent
            }
        };

        return (
            <textarea
                style={textareaStyle}
                value={content}
                onChange={handleChange}
            />
        );
    }

    updateProps(newProps) {
        this.props = { ...this.props, ...newProps };
        return this;
    }

    renderPropertiesPanel(onChange) {
        return (
            <div className="max-w-full overflow-auto">
                <RichPropertiesPanel
                    value={this.props}
                    onChange={onChange}
                />
            </div>
        );
    }

    clone() {
        return new RichLayer({
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

export default RichLayer;
