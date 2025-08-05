import TextLayer from "./TextLayer.js";
import ImageLayer from "./ImageLayer.js";

const LayerRegistry = {
    text: TextLayer,
    image: ImageLayer,
};

function buildLayer(id, data) {
    const Layer = LayerRegistry[data.type] || TextLayer;
    return new Layer({ id, ...data });
}

export { TextLayer, ImageLayer, buildLayer };
