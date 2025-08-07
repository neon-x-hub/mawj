class AbstractConfigProvider {
    constructor() {
        if (new.target === AbstractConfigProvider) {
            throw new Error("Cannot instantiate abstract class");
        }
    }

    getConfig(){
        throw new Error("Method 'getConfig()' must be implemented");
    }

    get(key){
        throw new Error("Method 'get()' must be implemented");
    }

    set(key, value){
        throw new Error("Method 'set()' must be implemented");
    }
}

export default AbstractConfigProvider;
