export class RenderContext {
    constructor({ project, template, rows, options, dataDir, dataRowsProvider, metadata }) {
        this.project = project;
        this.template = template;
        this.rows = rows;
        this.options = options;
        this.dataDir = dataDir;

        this.dataRowsProvider = dataRowsProvider;
        this.metadata = metadata;

        this.tmpDirs = {};
        this.currentRow = null;
        this.audioPath = null;
        this.thumbnailPath = null;
        this.outputPath = null;

        this.completed = 0;
        this.progress = 0;
    }

    setCurrentRow(row) {
        this.currentRow = row;
    }

    updateProgress(done, total, onProgress) {
        this.completed = done;
        this.progress = Math.round((done / total) * 100);
        if (onProgress) onProgress(this.progress);
    }
}
