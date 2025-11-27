import { Stage } from "./Stage.js";

export class MetadataStage extends Stage {
    constructor() {
        super("MetadataStage");
    }

    async run(ctx) {
        const { currentRow: row, project, dataRowsProvider, metadata } = ctx;

        try {
            // mark row done
            await dataRowsProvider.update(project.id, row.id, { status: true });

            // update metadata
            let doneCount = metadata.get("doneCount") || 0;
            doneCount++;
            !ctx.options.liveGen && metadata.set("doneCount", doneCount);
            await metadata.save();

            this.log(`Updated metadata for row ${row.id}`);
        } catch (err) {
            this.log(`Failed to update metadata for ${row.id}: ${err.message}`);
        }
    }
}
