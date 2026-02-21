import { AbstractTwRenderer } from "./abstract.js";

export class TwHTMLRenderer extends AbstractTwRenderer {
    constructor() {
        super();
    }

    render(node, renderStyle) {
        if (node.type === "text") {
            return node.value;
        }

        if (node.type === "style") {
            const style = renderStyle(node.tag);
            const inner = node.children.map(c => this.render(c, renderStyle)).join("");
            return `<span style="${style}">${inner}</span>`;
        }

        // root
        return node.children.map(c => this.render(c, renderStyle)).join("");
    }
}
