export class RenderContext {
    constructor({ project, template, rows, options, dataDir, onProgress }) {
        this.project = project;
        this.template = template;
        this.rows = rows;
        this.options = options;
        this.dataDir = dataDir;
        this.onProgress = onProgress;

        // Internal state
        this.currentRow = null;
        this.currentFrame = null;
        this.completed = 0;

        this.artifacts = {
            rows: [],        // row-level
            frames: [],      // frame-level
            metadata: {},    // extra
        };

        this.tmpDirs = {};
    }

    setCurrentRow(row) {
        this.currentRow = row;
        this.currentFrame = null; // reset frame
    }

    setCurrentFrame(frame) {
        this.currentFrame = frame;
    }

    commitRowProgress(rowId) {
        this.completed++;
        if (typeof this.onProgress === "function") {
            this.onProgress(rowId, this.completed, this.rows.length, this);
        }
    }
}
