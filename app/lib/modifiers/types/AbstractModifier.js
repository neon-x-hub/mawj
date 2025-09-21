// Abstract Modifier class
class Modifier {
    constructor(id, type, title = 'New Modifier', subtitle = 'Press to expand', options = {}) {
        if (new.target === Modifier) {
            throw new Error("Modifier is abstract and cannot be instantiated directly");
        }
        this.id = id;
        this.type = type;
        this.title = title;
        this.subtitle = subtitle;
        this.icon = options.icon || null;
    }

    // For rendering the properties editing panel
    renderPropertiesPanel(onChange) {
        throw new Error("Method 'renderPropertiesPanel()' must be implemented");
    }

    // For updating properties
    updateProps(newProps) {
        throw new Error("Method 'updateProps()' must be implemented");
    }

    clone() {
        throw new Error("Method 'clone()' must be implemented");
    }

    toObject() {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            subtitle: this.subtitle,
            options: {
                icon: this.icon,
                props: this.props
            },
            canvas: this.canvas

        }
    }
}

export default Modifier;
