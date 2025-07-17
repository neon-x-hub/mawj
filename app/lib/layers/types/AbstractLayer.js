// Abstract Layer class
class Layer {
  constructor(id, type = 'text', title = 'New Layer', subtitle = 'Press to expand', options = {}) {
    if (new.target === Layer) {
      throw new Error("Layer is abstract and cannot be instantiated directly");
    }
    this.id = id;
    this.type = type;
    this.title = title;
    this.subtitle = subtitle;
    this.icon = options.icon || null;
  }

  // For rendering the actual layer content (to be implemented by subclasses)
  renderContent() {
    throw new Error("Method 'renderContent()' must be implemented");
  }

  renderPreview() {
    throw new Error("Method 'renderPreview()' must be implemented");
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
}

export default Layer;
