import Modifier from "./AbstractModifier";

class FadeModifier extends Modifier {
    constructor({ id, title, subtitle, options = {}, canvas }) {
        super(id, 'fade', title, subtitle, options);
        this.icon = options.icon || '/icons/coco/line/Fade.svg';
        this.props = options.props || {};
        this.canvas = canvas;
    }

    renderPropertiesPanel(onChange) {
        return "Fade Modifier Properties Panel - To be implemented";
    }

    updateProps(newProps) {
        this.props = {
            ...this.props,
            ...newProps
        };
    }

    clone() {
        return new FadeModifier({
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

export default FadeModifier;
