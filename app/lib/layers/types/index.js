import TextLayer from "./TextLayer.js";
import ImageLayer from "./ImageLayer.js";
import RichLayer from "./RichLayer.js";

const LayerRegistry = {
    text: TextLayer,
    image: ImageLayer,
    rich: RichLayer
};

function buildLayer(id, data) {
    const Layer = LayerRegistry[data.type] || TextLayer;
    return new Layer({ id, ...data });
}

export { TextLayer, ImageLayer, RichLayer, buildLayer };
