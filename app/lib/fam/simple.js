import fs from "fs/promises";
import path from "path";

export class MetadataProvider {
    constructor({ filePath, revalidators = {}, provider }) {
        this.filePath = filePath;
        this.revalidators = revalidators;
        this.provider = provider;
        this.data = {};
    }

    async load(revalidationPropsIfIsFirstRun = {}) {
        let isFirstRun = false;

        try {
            const content = await fs.readFile(this.filePath, "utf8");
            this.data = JSON.parse(content);
        } catch (err) {
            if (err.code === "ENOENT") {
                this.data = {};
                isFirstRun = true; // brand new cache
            } else {
                throw err;
            }
        }

        // If this is the first run (no file existed), populate all keys
        if (isFirstRun) {
            for (const key of Object.keys(this.revalidators)) {
                try {
                    const value = await this.revalidators[key](this.provider, revalidationPropsIfIsFirstRun);
                    this.data[key] = value;
                } catch (revalErr) {
                    console.error(`❌ Failed to revalidate key "${key}" on first run:`, revalErr);
                }
            }
            await this.save();
        }
    }

    async save() {
        const dir = path.dirname(this.filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
    }

    /**
     * Revalidate a specific key using its registered revalidator function.
     * If no revalidator exists, throws.
     */
    async revalidate(key, revalidationProps) {
        const revalidator = this.revalidators[key];
        if (!revalidator) {
            throw new Error(`No revalidator registered for key: ${key}`);
        }

        const newValue = await revalidator(this.provider, revalidationProps);
        this.set(key, newValue);
        await this.save();
        return newValue;
    }
}
