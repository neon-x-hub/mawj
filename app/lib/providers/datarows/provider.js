export class DataProvider {
    constructor(projectId) {
        if (new.target === DataProvider) {
            throw new Error("Cannot instantiate abstract class");
        }
        this.projectId = projectId;
    }

    async appendRows(data) { throw new Error("(appendRows) Not implemented"); }
    async findRows(filter) { throw new Error("(findRows) Not implemented"); }
    async getRow(id) { throw new Error("(getRow) Not implemented"); }
    async updateRow(id, updates) { throw new Error("(updateRow) Not implemented"); }
    async deleteRow(id) { throw new Error("(deleteRow) Not implemented"); }
    async getMetadata() { throw new Error("(getMetadata) Not implemented"); }
}
