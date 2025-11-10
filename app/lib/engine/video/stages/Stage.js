export class Stage {
    constructor(name) {
        this.name = name || this.constructor.name;
    }

    async run(context) {
        throw new Error(`${this.name} must implement run(context)`);
    }

    log(msg) {
        console.log(`[${this.name}] ${msg}`);
    }
}
