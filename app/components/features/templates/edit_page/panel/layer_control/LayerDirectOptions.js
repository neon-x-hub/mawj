'use client';

import { Listbox, ListboxItem } from "@heroui/react";
import { useLayers } from "@/app/lib/layers/context/LayerContext";

import { TextLayer, ImageLayer } from "@/app/lib/layers/types";


export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">
        {children}
    </div>
);

export default function LayerDirectOptions({ layer }) {

    const canvas = { width: 1920, height: 1080 };

    const { layers, setLayers } = useLayers();

    const handleAddLayer = (key) => {
        // Handle the selected layer type
        switch (key) {
            case "hide":
                console.log("Hiding layer");
                console.log(layer);
                break;
            case "duplicate":
                console.log("Duplicating layer");
                break;
            case "delete":
                console.log("Deleting layer");
                setLayers(layers.filter(l => l.id !== layer.id));
                break;
            default:
                console.warn("Unknown layer type:", key);
        }
    };

    return (
        <div className="space-y-1 w-[120px] max-w-md">
            <ListboxWrapper>
                <Listbox aria-label="Layer Types" onAction={handleAddLayer} className="font-medium">
                    <ListboxItem key="hide">Hide</ListboxItem>
                    <ListboxItem key="duplicate">Duplicate</ListboxItem>
                    <ListboxItem
                        key="delete"
                        color="danger"
                        classNames={{
                            wrapper: "group",
                            title: " group-hover:text-white",
                        }}
                    >Delete</ListboxItem>
                </Listbox>
            </ListboxWrapper>
        </div>
    );
}
