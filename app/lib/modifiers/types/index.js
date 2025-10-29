import FadeModifier from "./FadeModifier";
import BgControlModifier from "./BGControlModifier";

const modifiers = {
    fade: FadeModifier,
    bgctrl: BgControlModifier
};

function buildModifier(id, data) {
    if (!data || !data.type || !modifiers[data.type]) {
        throw new Error("Invalid modifier type");
    }
    const ModifierClass = modifiers[data.type];
    return new ModifierClass({ id, ...data });
}

export { FadeModifier, BgControlModifier, buildModifier };
