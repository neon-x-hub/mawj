import fs from "fs";
import path from "path";
import AbstractConfigProvider from "./provider";

class ConfigProvider extends AbstractConfigProvider {
    constructor(configFileName = "mawj.config.json") {
        super();

        const projectRoot = this._findProjectRoot();
        this.configPath = path.join(projectRoot, configFileName);

        this.config = this._loadConfig();
    }

    _findProjectRoot() {
        let dir = process.cwd();

        while (!fs.existsSync(path.join(dir, "package.json"))) {
            const parentDir = path.dirname(dir);
            if (dir === parentDir) break; // reached root
            dir = parentDir;
        }

        return dir;
    }

    _loadConfig() {
        try {
            if (!fs.existsSync(this.configPath)) {
                const defaultConfig = {};
                fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
                return defaultConfig;
            }

            const raw = fs.readFileSync(this.configPath, "utf-8");
            return JSON.parse(raw);
        } catch (err) {
            console.warn(`⚠️ Failed to load config from ${this.configPath}:`, err.message);
            return {};
        }
    }


    _saveConfig() {
        try {
            const tempPath = this.configPath + ".tmp";

            fs.writeFileSync(
                tempPath,
                JSON.stringify(this.config, null, 2),
                "utf-8"
            );

            fs.renameSync(tempPath, this.configPath);
        } catch (err) {
            console.error(`❌ Failed to write config to ${this.configPath}:`, err.message);
        }
    }

    set(key, value) {
        this.config[key] = value;
        this._saveConfig();
    }

    get(key) {
        return this.config[key];
    }

    has(key) {
        return Object.prototype.hasOwnProperty.call(this.config, key);
    }

    delete(key) {
        if (this.has(key)) {
            delete this.config[key];
            this._saveConfig();
        }
    }

    getConfig() {
        return { ...this.config };
    }

    clear() {
        this.config = {};
        this._saveConfig();
    }
}

export default ConfigProvider;
