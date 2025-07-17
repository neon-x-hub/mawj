import { TextPropertiesPanel } from "@/app/components/core/menu/TextEditPanel";
import Layer from "./AbstractLayer";
import { direction } from "direction";
import fitty from "fitty";


// Defaults
import { TEXT_DEFAULTS } from "@/app/lib/defaults";

// Text Layer implementation
class TextLayer extends Layer {
    constructor({ id, title, subtitle, options = {}, canvas }) {
        super(id, 'text', title, subtitle, options);
        this.icon = options.icon || '/icons/coco/line/Text.svg';
        this.textProps = {
            ...TEXT_DEFAULTS,
            ...options.textProps // Override defaults
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

    /* ------------------------- 1. 改进 buildStyle ------------------------- */
    buildStyle() {

        const {
            content,
            rotation,
            skewX,
            skewY,
            left,
            top,
            direction: userDirection,
            textAlign: userTextAlign,
            fontSize,
            responsiveFont,
            minFontSize,
            maxFontSize,
            ...styleProps
        } = this.textProps;


        const inferredDirection = direction(content || '') === 'rtl' ? 'rtl' : 'ltr';
        const inferredTextAlign = inferredDirection === 'rtl' ? 'right' : 'left';

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
            direction: userDirection || inferredDirection,
            textAlign: userTextAlign || inferredTextAlign,
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
        };

        if (responsiveFont && this.canvas) {
            const computedFontSize = this._computeFontSize({
                width: styleProps.width || '100%',
                height: styleProps.height || '100%',
                min: minFontSize,
                max: maxFontSize,
                canvasWidth: this.canvas.width,
                canvasHeight: this.canvas.height,
                content
            });

            baseStyle.fontSize = `${computedFontSize}px`;

            console.log('computedFontSize', computedFontSize);


        } else if (fontSize) {
            baseStyle.fontSize = fontSize;
        }

        return { style: baseStyle };
    }


    renderPreview(onChange) {
        const { content } = this.textProps;
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
        }
        const handleChange = (e) => {
            const newContent = e.target.value;
            this.textProps.content = newContent; // still update internal state
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

    renderContent({ node_key }) {

        console.log('Rendering text layer... ', this.id); // This logs


        const { content } = this.textProps;
        const elementId = `text-layer-${this.id}`;
        const { style } = this.buildStyle();

        return (
            <div
                key={node_key}
                id={elementId}
                style={style}
            >
                {content}
            </div>
        );
    }


    _computeFontSize({
        width,
        height,
        canvasWidth,
        canvasHeight,
        min = 12,
        max = 96,
        content = ''
    }) {
        const parsePx = (val) =>
            typeof val === 'string' ? parseFloat(val.replace('px', '')) : val;

        const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

        const minSize = parsePx(min);
        const maxSize = parsePx(max);

        const containerWidth = parsePx(width);
        const containerHeight = parsePx(height);
        const cWidth = parsePx(canvasWidth);
        const cHeight = parsePx(canvasHeight);

        if (!containerWidth || !containerHeight || !cWidth || !cHeight) {
            return minSize;
        }

        // Step 1: Scaling based on container vs canvas
        const widthScale = containerWidth / cWidth;
        const heightScale = containerHeight / cHeight;
        const baseScale = Math.min(widthScale, heightScale); // maintain aspect ratio

        // Step 2: Adjust based on content length
        const contentLength = content.length || 1;
        const idealLength = 20; // tweak this value based on your design
        const contentScale = clamp(idealLength / contentLength, 0.5, 1); // never shrink more than 50%

        // Step 3: Combine both
        const combinedScale = baseScale * contentScale;

        const interpolatedSize = minSize + (maxSize - minSize) * combinedScale;
        const clampedFontSize = clamp(interpolatedSize, minSize, maxSize);

        return clampedFontSize;
    }

    renderPropertiesPanel(onChange) {
        return (
            <div className="max-w-full overflow-auto">
                <TextPropertiesPanel
                    value={this.textProps}
                    onChange={onChange}
                />
            </div>
        );
    }

    updateProps(newProps) {
        this.textProps = { ...this.textProps, ...newProps };
        return this;
    }
    clone() {
        return new TextLayer({
            id: this.id,
            title: this.title,
            subtitle: this.subtitle,
            options: {
                icon: this.icon,
                textProps: { ...this.textProps }
            },
            canvas: this.canvas
        });
    }

}

export default TextLayer;
