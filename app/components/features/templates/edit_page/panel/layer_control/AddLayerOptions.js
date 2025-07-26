'use client';
// I18N
import { t } from "@/app/i18n";

import { Listbox, ListboxItem, Divider } from "@heroui/react";
import { useLayers } from "@/app/lib/layers/context/LayerContext";

import { TextLayer, ImageLayer } from "@/app/lib/layers/types";

// useLedgex
import { useLedgex } from "@/app/lib/state-ledger/useLedgex";

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">
        {children}
    </div>
);

export const LayerTypesInfo = () => (
    <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-semibold">{t('actions.generic.add.label', { object: t('common.layer') })}</p>
        <p className="text-sm text-gray-500">{t('messages.layer.type.choose_type_to_add')}</p>
    </div>
);

export default function AddLayerOptions() {

    const canvas = { width: 1920, height: 1080 };

    const { layers, setLayers } = useLayers();
    const { get, set } = useLedgex();

    const handleAddLayer = (key) => {
        // Handle the selected layer type
        switch (key) {
            case "text":
                console.log("Adding a Text layer");
                // add a new text layer
                const newLayer = new TextLayer({
                    id: layers.length + 1,
                    canvas
                });
                setLayers([...layers, newLayer]);
                set({
                    [newLayer.id]: {
                        type: newLayer.type,
                        title: newLayer.title,
                        subtitle: newLayer.subtitle,
                        options: { props: newLayer.options },
                        canvas
                    }
                })
                break;
            case "image":
                console.log("Adding an Image layer");
                // add a new image layer
                const newImageLayer = new ImageLayer({
                    id: layers.length + 1,
                    canvas
                });
                set({
                    [newLayer.id]: {
                        type: newLayer.type,
                        title: newLayer.title,
                        subtitle: newLayer.subtitle,
                        options: { props: newLayer.options },
                        canvas
                    }
                })
                setLayers([...layers, newImageLayer]);
                break;
            case "custom":
                console.log("Adding a Custom layer");
                break;
            default:
                console.warn("Unknown layer type:", key);
        }
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
