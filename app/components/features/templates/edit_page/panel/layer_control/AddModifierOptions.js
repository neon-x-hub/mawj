'use client';
// I18N
import { t } from "@/app/i18n";

import { Listbox, ListboxItem, Divider } from "@heroui/react";
import { useLayers } from "@/app/lib/layers/context/LayerContext";
import { FadeModifier } from "@/app/lib/modifiers/types";


export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">
        {children}
    </div>
);

export const ModifiersTypesInfo = () => (
    <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-semibold">
            {t('actions.generic.add.label', { object: t('common.layer') })}
        </p>
        <p className="text-sm text-gray-500">
            {t('messages.layer.type.choose_type_to_add')}
        </p>
    </div>
);

export default function AddModifierOptions() {
    const { layers, setLayers } = useLayers();  // layers = { base: [...], regular: [...], modifiers: [...] }

    const handleAddLayer = (key) => {
        let newLayer;

        switch (key) {
            case "fade":
                console.log("Adding a Fade modifier");
                newLayer = new FadeModifier({
                    id: `modifier-${(layers.modifiers?.length ?? 0) + 1}`,
                });
                break;

            default:
                console.warn("Unknown modifier type:", key);
                return;
        }

        // ✅ Update regular layers array
        const updatedModifiers = layers.modifiers ? [...layers.modifiers, newLayer] : [newLayer];
        setLayers({ ...layers, modifiers: updatedModifiers });
    };

    return (
        <div className="space-y-1 max-w-md">
            <ModifiersTypesInfo />
            <Divider />
            <ListboxWrapper>
                <Listbox aria-label="Layer Types" onAction={handleAddLayer}>
                    <ListboxItem key="fade">تلاشي/ظهور (Fade)</ListboxItem>
                    <ListboxItem key="base_layer">معدل الاساس (Base Layer)</ListboxItem>
                    <ListboxItem key="intro_outro">مقدمة/خاتمة (Intro/Outro)</ListboxItem>
                </Listbox>
            </ListboxWrapper>
        </div>
    );
}
