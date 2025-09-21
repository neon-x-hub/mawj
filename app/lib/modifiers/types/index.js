import FadeModifier from "./FadeModifier";

const modifiers = {
    fade: FadeModifier
};

function buildModifier(id, data) {
    if (!data || !data.type || !modifiers[data.type]) {
        throw new Error("Invalid modifier type");
    }
    const ModifierClass = modifiers[data.type];
    return new ModifierClass({ id, ...data });
}

export { FadeModifier, buildModifier };
