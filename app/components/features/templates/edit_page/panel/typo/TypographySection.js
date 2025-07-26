import React from 'react'
import { t } from '@/app/i18n'
import { Autocomplete, AutocompleteItem, NumberInput, Select, SelectItem } from '@heroui/react'
import PanelSectionTitle from '../SectionTitle';
import FontSizeInputWithMode from './FontSizeWithMode';



// Constants
const FONT_FAMILIES = [
    "Arial", "Helvetica", "Georgia", "Times New Roman",
    "Courier New", "Verdana", "Trebuchet MS", "Comic Sans MS", "Segoe Print",
    "IBM Plex Sans Arabic"
];

const FONT_WEIGHTS = [
    "100", "200", "300", "400", "500", "600", "700", "800", "900"
];

const DECORATIONS = ["none", "underline", "line-through", "overline"];

export default function TypographySection({ value, update }) {



    return (
        <section className="flex flex-col gap-3">
            <PanelSectionTitle
                title={t("layers.text.typography")}
                iconSrc={'/icons/haicon/line/text-small-caps.svg'}
                iconOptions={{
                    height: "19px",
                    width: "19px",
                }}
            />
            <Autocomplete
                label={t("layers.text.fontFamily")}
                selectedKey={value.fontFamily}
                onSelectionChange={(key) => update({ fontFamily: key })}
            >
                {FONT_FAMILIES.map((font) => (
                    <AutocompleteItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                    </AutocompleteItem>
                ))}
            </Autocomplete>

            <FontSizeInputWithMode
                fontSize={value.fontSize}
                responsiveFont={value.responsiveFont}
                minFontSize={value.minFontSize}
                maxFontSize={value.maxFontSize}
                onChange={(val) => update({ fontSize: val })}
                onToggle={() => update({ responsiveFont: !value.responsiveFont })}
                onMinMaxChange={(patch) => update(patch)}
            />


            <Select
                label={t("layers.text.fontWeight")}
                selectedKeys={[String(value.fontWeight)]}
                onSelectionChange={(keys) =>
                    update({ fontWeight: Array.from(keys)[0] })
                }
            >
                {FONT_WEIGHTS.map((w) => (
                    <SelectItem key={w} value={w}>
                        {w}
                    </SelectItem>
                ))}
            </Select>

            <Select
                label={t("layers.text.decoration")}
                selectedKeys={[value.textDecoration]}
                onSelectionChange={(keys) =>
                    update({ textDecoration: Array.from(keys)[0] })
                }
            >
                {DECORATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                        {t(`layers.text.decorations.${d}`)}
                    </SelectItem>
                ))}
            </Select>
        </section>
    )
}
