import TextLayer from "./TextLayer";
import ImageLayer from "./ImageLayer";

const LayerRegistry = {
    text: TextLayer,
    image: ImageLayer,
};

function buildLayer(id, data) {
    const Layer = LayerRegistry[data.type] || TextLayer;
    return new Layer({ id, ...data });
}

export { TextLayer, ImageLayer, buildLayer };
