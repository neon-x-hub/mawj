/**
 * Minimalist DB Provider Interface
 */
class DBProvider {
    constructor() {
        if (new.target === DBProvider) {
            throw new Error("Cannot instantiate abstract class");
        }
    }

    /**
     * @param {string} collectionName
     * @param {object} data
     * @returns {Promise<object>} The created data with ID
     */
    async create(collectionName, data) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} collectionName
     * @param {object} filter
     * @returns {Promise<object[]>}
     */
    async find(collectionName, filter = {}) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} collectionName
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async findById(collectionName, id) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} collectionName
     * @param {string} id
     * @param {object} updates
     * @returns {Promise<object|null>} Updated document
     */
    async update(collectionName, id, updates) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} collectionName
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async delete(collectionName, id) {
        throw new Error("Not implemented");
    }
}

export default DBProvider;
