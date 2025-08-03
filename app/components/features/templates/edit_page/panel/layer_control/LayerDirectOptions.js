'use client';

// I18N
import { t } from "@/app/i18n";

import { useMemo } from "react";
import { Listbox, ListboxItem } from "@heroui/react";
import throttle from "@/app/lib/helpers/throttle";

import MaskedIcon from "@/app/components/core/icons/Icon";
import { useLayers } from "@/app/lib/layers/context/LayerContext";
import { useLedgex } from "@/app/lib/state-ledger/useLedgex";
import { TextLayer, ImageLayer } from "@/app/lib/layers/types";

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">
        {children}
    </div>
);

export default function LayerDirectOptions({ layer }) {
    const { layers, setLayers } = useLayers();
    const { set, get, remove } = useLedgex();

    const throttledSet = useMemo(() => throttle(set, 300), [set]);

    const currentLayer = layers.regular.find(l => l.id === layer.id);
    const isHidden = currentLayer?.props?.opacity === 0;

    /** ✅ Toggle Hide/Show */
    const handleToggleVisibility = () => {
        const newOpacity = isHidden ? 1 : 0;
        setLayers(prevLayers => ({
            ...prevLayers,
            regular: prevLayers.regular.map(l => {
                if (l.id === layer.id) {
                    const updatedLayer = l.clone();
                    updatedLayer.updateProps({ opacity: newOpacity });

                    throttledSet({
                        [layer.id]: {
                            type: updatedLayer.type,
                            title: updatedLayer.title,
                            subtitle: updatedLayer.subtitle,
                            options: {
                                icon: updatedLayer.icon,
                                props: updatedLayer.props,
                            },
                            canvas: updatedLayer.canvas,
                        },
                    });

                    return updatedLayer;
                }
                return l;
            })
        }));

    };

    /** ✅ Duplicate Layer with persistence */
    const handleDuplicate = () => {
        setLayers(prevLayers => {
            const original = prevLayers.regular.find(l => l.id === layer.id);
            if (!original) return prevLayers;

            const duplicate = original.clone();
            duplicate.id = `${original.id}-${Date.now()}`;
            duplicate.title = `${original.title} Copy`;

            throttledSet({
                [duplicate.id]: {
                    type: duplicate.type,
                    title: duplicate.title,
                    subtitle: duplicate.subtitle,
                    options: {
                        icon: duplicate.icon,
                        props: duplicate.props,
                    },
                    canvas: duplicate.canvas,
                },
            });

            console.log("Duplicated Layer:", duplicate);
            console.log("Ledgex State After Duplication:", get());

            return {
                ...prevLayers,
                regular: [...prevLayers.regular, duplicate],
            };
        });

    };

    /** ✅ Delete Layer with Ledgex remove */
    const handleDelete = () => {
        setLayers(prevLayers => ({
            ...prevLayers,
            regular: prevLayers.regular.filter(l => l.id !== layer.id),
        }));
        remove(layer.id);
    };

    /** ✅ Dispatch actions */
    const handleAddLayer = (key) => {
        switch (key) {
            case "hide":
                handleToggleVisibility();
                break;
            case "duplicate":
                handleDuplicate();
                break;
            case "delete":
                handleDelete();
                break;
            default:
                console.warn("Unknown action:", key);
        }
    };

    return (
        <div className="space-y-1 w-[120px] max-w-md">
            <ListboxWrapper>
                <Listbox aria-label="Layer Actions" onAction={handleAddLayer}>

                    {/* ✅ Hide / Show */}
                    <ListboxItem
                        key="hide"
                        startContent={
                            <MaskedIcon
                                src={`/icons/coco/line/${isHidden ? "Eye.svg" : "Eye-slash.svg"}`}
                                height="18px"
                                width="18px"
                                color="currentColor"
                            />
                        }

                        classNames={{
                            title: 'font-medium',
                        }}
                    >
                        {isHidden ? t("actions.show") : t("actions.hide")}
                    </ListboxItem>

                    {/* ✅ Duplicate */}
                    <ListboxItem
                        key="duplicate"
                        startContent={
                            <MaskedIcon
                                src="/icons/coco/line/Copy.svg"
                                height="18px" width="18px"
                                color={"currentColor"}
                            />}

                        classNames={{
                            title: 'font-medium',
                        }}
                    >
                        {t("actions.duplicate")}
                    </ListboxItem>

                    {/* ✅ Delete */}
                    <ListboxItem
                        key="delete"
                        color="danger"
                        startContent={
                            <MaskedIcon
                                src="/icons/coco/line/Trash-2.svg"
                                height="18px"
                                width="18px"
                                color="currentColor"
                                className="group-hover:text-white"
                            />

                        }
                        classNames={{
                            wrapper: "group text-danger",
                            title: "group-hover:text-white font-medium",
                        }}
                    >
                        {t("actions.delete")}
                    </ListboxItem>
                </Listbox>
            </ListboxWrapper>
        </div>
    );
}
