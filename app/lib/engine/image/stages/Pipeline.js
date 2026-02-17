export class Pipeline {
    constructor(stages = []) {
        this.stages = stages;
    }

    addStage(stage) {
        this.stages.push(stage);
    }

    async run(ctx) {
        for (const stage of this.stages) {
            await stage.run(ctx);
        }
    }
}
