// lib/layers/types/TextLayer.js
import { TextPropertiesPanel } from '../../../components/core/menu/TextEditPanel';
import Layer from './AbstractLayer';
import { direction } from 'direction';
import InterpolationEngine from '../../interpolation/engine';
import tw from '../../tw';
// Defaults
import { TEXT_DEFAULTS } from '../../defaults';

// Text Layer implementation
class TextLayer extends Layer {
    constructor({ id, title, subtitle, options = {}, canvas }) {
        super(id, 'text', title, subtitle, options);
        this.icon = options.icon || '/icons/coco/line/Text.svg';
        this.props = {
            ...TEXT_DEFAULTS,
            ...options.props // Override defaults
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

    normalizeFontFamily(name) {
        // Always wrap in double quotes and escape any existing quotes
        const safeName = name.replace(/"/g, '\\"');
        return `"${safeName}"`;
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
            customCSS,
            customCSSOverwrite = false,
            ...styleProps
        } = this.props;

        // 1. Infer text direction and alignment
        const inferredDirection = direction(content || "") === "rtl" ? "rtl" : "ltr";
        const inferredTextAlign = inferredDirection === "rtl" ? "right" : "left";

        // 2. Build transform string
        const transformParts = [this.buildTransform({ rotation, skewX, skewY })];
        if (left && /%$/.test(left)) transformParts.push("translateX(-50%)");
        if (top && /%$/.test(top)) transformParts.push("translateY(-50%)");

        // 3. Base style skeleton
        let baseStyle = {
            ...styleProps,
            left,
            top,
            display: "inline-block",
            transform: transformParts.filter(Boolean).join(" "),
            transformOrigin: "center center",
            direction: userDirection || inferredDirection,
            textAlign: userTextAlign || inferredTextAlign,
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
        };

        // 4. Interpolation support for *all* style props (including fontSize)
        for (const [key, val] of Object.entries(styleProps)) {
            if (val && typeof val === "object" && val.type === "interpolation") {
                try {
                    baseStyle[key] = InterpolationEngine.compute(val, { content });
                } catch (err) {
                    console.warn(`Interpolation failed for style property "${key}"`, err);
                }
            }
        }

        // 5. Normalize font family name
        if (styleProps.fontFamily) {
            baseStyle.fontFamily = this.normalizeFontFamily(styleProps.fontFamily);
        }

        // 6. Apply customCSS
        if (customCSS) {
            try {
                let cssObject = {};
                if (typeof customCSS === "string") {
                    customCSS.split(";").forEach(rule => {
                        const [prop, val] = rule.split(":").map(s => s && s.trim());
                        if (prop && val) {
                            const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                            cssObject[camelProp] = val;
                        }
                    });
                } else if (typeof customCSS === "object") {
                    cssObject = customCSS;
                }

                if (customCSSOverwrite) {
                    baseStyle = { ...baseStyle, ...cssObject };
                } else {
                    for (const [key, val] of Object.entries(cssObject)) {
                        if (!(key in baseStyle)) {
                            baseStyle[key] = val;
                        }
                    }
                }
            } catch (err) {
                console.warn("Failed to apply customCSS:", err);
            }
        }

        return { style: baseStyle };
    }

    renderPreview(onChange) {
        const { content } = this.props;
        const { style } = this.buildStyle();

        const textareaStyle = {
            ...style,
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "auto",
            top: "auto",
            left: "auto",
            transform: "none",
            resize: "none",
        };

        const handleChange = (e) => {
            const newContent = e.target.value;
            this.props.content = newContent; // still update internal state
            if (typeof onChange === "function") {
                onChange({ content: newContent });
            }
        };

        // Utility: remove Arabic diacritics (Tashkeel)
        const stripDiacritics = (text) =>
            text.replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, "");

        const totalLength = content?.length || 0;
        const plainLength = content ? stripDiacritics(content).length : 0;

        return (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <textarea
                    style={textareaStyle}
                    value={content}
                    onChange={handleChange}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "4px",
                        right: "6px",
                        fontSize: "10px",
                        fontFamily: "monospace",
                        opacity: 0.6,
                        lineHeight: "1.2",
                        textAlign: "right",
                    }}
                >
                    <div>{totalLength}</div>
                    <div>{plainLength}</div>
                </div>
            </div>
        );
    }

    renderContent({ node_key }) {

        const { content } = this.props;
        const elementId = `text-layer-${this.id}`;
        const { style } = this.buildStyle();

        if (style.useTw) {
            const parsedContent = tw(content || "");
            return (
                <div
                    key={node_key}
                    id={elementId}
                    style={style}
                    dangerouslySetInnerHTML={{ __html: parsedContent }}
                >
                </div>
            );
        }

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
        return new TextLayer({
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

export default TextLayer;
