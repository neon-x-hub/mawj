import React from 'react'
import { t } from '@/app/i18n'

import ColorPickerSection from './ColorPickerSec'
import PanelSectionTitle from '../SectionTitle'
import { NumberInput } from '@heroui/react'

export default function ColorSection({ value, update }) {
    return (
        <section className="flex flex-col gap-3">

            <PanelSectionTitle
                title={t("layers.text.colors")}
                iconSrc={"/icons/haicon/line/colors.svg"}
                iconOptions={{
                    height: "20px",
                    width: "20px",
                }}
            />

            <NumberInput
                label={t("layers.text.opacity")}
                value={value.opacity}
                step={0.01}
                max={1}
                min={0}
                onValueChange={(newOpacity) => update({ opacity: newOpacity })}
            />

            <ColorPickerSection
                color={value.color}
                onChange={(newColor) => update({ color: newColor })}
                label={t("layers.text.textColor")}
            />

            <ColorPickerSection
                color={value.backgroundColor}
                onChange={(newColor) => update({ backgroundColor: newColor })}
                label={t("layers.text.backgroundColor")}
            />



        </section>
    )
}
