import Modifier from "./AbstractModifier";
import BGCTRLPropertiesPanel from "@/app/components/core/menu/modifiers_menus/BGCTRLPropertiesPanel";

class BgControlModifier extends Modifier {
    constructor({ id, title, subtitle, options = {}, canvas }) {
        super(id, 'bgctrl', title, subtitle, options);
        this.icon = options.icon || '/icons/coco/line/Scan-2.svg';
        this.props = options.props || {};
        this.canvas = canvas;
    }

    renderPropertiesPanel(onChange) {
        return (
            <div className="max-w-full overflow-auto">
                <BGCTRLPropertiesPanel
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
        return new BgControlModifier({
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

export default BgControlModifier;
