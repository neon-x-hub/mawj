export class AbstractTwRenderer {
    constructor() {
        if (new.target === AbstractTwRenderer) {
            throw new TypeError("Cannot construct AbstractTwRenderer instances directly");
        }
    }

    render(node, styleResolver) {
        throw new Error("render() must be implemented by subclass");
    }
}
