'use client';
// I18N
import { t } from "@/app/i18n";

import { Listbox, ListboxItem, Divider } from "@heroui/react";
import { useLayers } from "@/app/lib/layers/context/LayerContext";
import { TextLayer, ImageLayer, RichLayer } from "@/app/lib/layers/types";

// useLedgex
import { useLedgex } from "@/app/lib/state-ledger/useLedgex";

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">
        {children}
    </div>
);

export const LayerTypesInfo = () => (
    <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-semibold">
            {t('actions.generic.add.label', { object: t('common.layer') })}
        </p>
        <p className="text-sm text-gray-500">
            {t('messages.layer.type.choose_type_to_add')}
        </p>
    </div>
);

export default function AddLayerOptions() {
    const { layers, setLayers } = useLayers();  // layers = { base: [...], regular: [...] }
    const { get, set } = useLedgex();

    const handleAddLayer = (key) => {
        let newLayer;

        switch (key) {
            case "text":
                console.log("Adding a Text layer");
                newLayer = new TextLayer({
                    id: `layer-${layers.regular.length + 1}`,
                    canvas: {
                        width: layers?.base[0]?.width,
                        height: layers?.base[0]?.height
                    },
                });
                break;

            case "image":
                console.log("Adding an Image layer");
                newLayer = new ImageLayer({
                    id: `layer-${layers.regular.length + 1}`,
                    canvas: {
                        width: layers?.base[0]?.width,
                        height: layers?.base[0]?.height
                    },
                });
                break;

            case "custom":
                console.log("Adding a Custom (Rich) layer");
                newLayer = new RichLayer({
                    id: `layer-${layers.regular.length + 1}`,
                    canvas: {
                        width: layers?.base[0]?.width,
                        height: layers?.base[0]?.height
                    },
                });
                break;

            default:
                console.warn("Unknown layer type:", key);
                return;
        }

        // ✅ Update regular layers array
        const updatedRegular = [...layers.regular, newLayer];
        setLayers({ ...layers, regular: updatedRegular });

        // ✅ Push to Ledgex for undo/redo
        set({
            [newLayer.id]: newLayer.toObject(),
        });
    };

    return (
        <div className="space-y-1 max-w-md">
            <LayerTypesInfo />
            <Divider />
            <ListboxWrapper>
                <Listbox aria-label="Layer Types" onAction={handleAddLayer}>
                    <ListboxItem key="text">نص (Text)</ListboxItem>
                    <ListboxItem key="image">صورة (Image)</ListboxItem>
                    <ListboxItem key="custom">مخصص (Custom)</ListboxItem>
                </Listbox>
            </ListboxWrapper>
        </div>
    );
}
