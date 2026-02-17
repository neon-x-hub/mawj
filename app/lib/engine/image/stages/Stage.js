export class Stage {
    constructor(name) {
        this.name = name || this.constructor.name;
    }

    /**
     * @param {RenderContext} ctx
     * @returns {Promise<void>}
     */
    async run(ctx) {
        throw new Error(`Stage.run() not implemented in ${this.name}`);
    }
    log(msg) {
        console.log(`[${this.name}] ${msg}`);
    }
}
