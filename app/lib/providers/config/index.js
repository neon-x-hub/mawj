// config/index.js
import ConfigProvider from "./simple";

let configProviderInstance = null;
let initializationPromise = null;

async function getConfigProvider() {
    if (configProviderInstance) return configProviderInstance;

    if (!initializationPromise) {
        initializationPromise = (async () => {
            const instance = new ConfigProvider();
            return instance;
        })();
    }

    configProviderInstance = await initializationPromise;
    return configProviderInstance;
}

const config = new Proxy(
    {},
    {
        get(_target, prop) {
            return async (...args) => {
                const instance = await getConfigProvider();
                const value = instance[prop];
                if (typeof value === "function") {
                    return value.apply(instance, args);
                }
                return value;
            };
        },
    }
);

export default config;
