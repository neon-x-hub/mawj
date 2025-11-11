import Modifier from "./AbstractModifier";
import FadePropertiesPanel from "@/app/components/core/menu/modifiers_menus/FadePropertiesPanel";

class FadeModifier extends Modifier {
    constructor({ id, title, subtitle, options = {}, canvas }) {
        super(id, 'fade', title, subtitle, options);
        this.icon = options.icon || '/icons/coco/line/Sunrise.svg';
        this.props = options.props || {};
        this.canvas = canvas;
    }

    renderPropertiesPanel(onChange) {
        return (
            <div className="max-w-full overflow-auto">
                <FadePropertiesPanel
                    value={this.props}
                    onChange={onChange}
                />
            </div>
        );
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
