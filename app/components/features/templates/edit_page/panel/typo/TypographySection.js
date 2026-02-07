import React, { useEffect, useState } from "react";
import { t } from "@/app/i18n";
import {
    Autocomplete,
    AutocompleteItem,
    Select,
    SelectItem,
} from "@heroui/react";
import PanelSectionTitle from "../SectionTitle";
import { loadCustomFont } from "@/app/lib/fonts/fontLoader";
import { InterpolatableInput } from "@/app/components/core/inputs/InterpolatableInput";

const FALLBACK_FONTS = [
    { name: "Arial", style: "normal" },
    { name: "Helvetica", style: "normal" },
    { name: "Georgia", style: "normal" },
    { name: "Times New Roman", style: "normal" },
    { name: "Courier New", style: "normal" },
    { name: "Verdana", style: "normal" },
    { name: "Trebuchet MS", style: "normal" },
    { name: "Comic Sans MS", style: "normal" },
];

const FONT_WEIGHTS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
const DECORATIONS = ["none", "underline", "line-through", "overline"];
const TEXT_TRANSFORMS = ["none", "uppercase", "lowercase", "capitalize"];
const FONT_STYLES = ["normal", "italic", "oblique"];

export default function TypographySection({ value, update }) {
    const [fonts, setFonts] = useState(FALLBACK_FONTS);

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const res = await fetch("/api/v1/fonts");
                if (!res.ok) throw new Error();
                const json = await res.json();
                if (Array.isArray(json.data)) setFonts(json.data);
            } catch {
                setFonts(FALLBACK_FONTS);
            }
        };
        fetchFonts();
    }, []);

    /** Stable key used everywhere */
    const makeFontKey = (f) => `${f.name}-${f.style}`;

    const handleFontChange = (key) => {
        const font = fonts.find((f) => makeFontKey(f) === key);
        if (!font) return;

        if (font.url) {
            loadCustomFont(font.name, font.style, font.url);
        }

        update({
            fontFamilyKey: key,
            fontFamily: font.name,
            fontFamilyStyle: font.style,
        });
    };

    return (
        <section className="flex flex-col gap-3">
            <PanelSectionTitle
                title={t("layers.text.typography")}
                iconSrc="/icons/haicon/line/text-small-caps.svg"
                iconOptions={{ height: "19px", width: "19px" }}
            />

            {/* Font family */}
            <Autocomplete
                label={t("layers.text.fontFamily")}
                selectedKey={value.fontFamilyKey ?? null}
                onSelectionChange={handleFontChange}
                allowsCustomValue
            >
                {fonts.map((font) => {
                    const key = makeFontKey(font);
                    return (
                        <AutocompleteItem
                            key={key}
                            textValue={font.name}
                            style={{ fontFamily: font.name }}
                        >
                            <span>{font.name}</span>
                        </AutocompleteItem>
                    );
                })}
            </Autocomplete>

            {/* Font size */}
            <InterpolatableInput
                label={t("layers.text.fontSize")}
                value={value.fontSize}
                onChange={(v) => update({ fontSize: v })}
                unit="px"
            />

            {/* Font weight */}
            <Select
                label={t("layers.text.fontWeight")}
                selectedKeys={[String(value.fontWeight)]}
                onSelectionChange={(keys) =>
                    update({ fontWeight: Array.from(keys)[0] })
                }
            >
                {FONT_WEIGHTS.map((w) => (
                    <SelectItem key={w}>{w}</SelectItem>
                ))}
            </Select>

            {/* Decoration */}
            <Select
                label={t("layers.text.decoration")}
                selectedKeys={[value.textDecoration]}
                onSelectionChange={(keys) =>
                    update({ textDecoration: Array.from(keys)[0] })
                }
            >
                {DECORATIONS.map((d) => (
                    <SelectItem key={d}>
                        {t(`layers.text.decorations.${d}`)}
                    </SelectItem>
                ))}
            </Select>

            {/* Text transform */}
            <Select
                label={t("layers.text.transform")}
                selectedKeys={[value.textTransform]}
                onSelectionChange={(keys) =>
                    update({ textTransform: Array.from(keys)[0] })
                }
            >
                {TEXT_TRANSFORMS.map((tt) => (
                    <SelectItem key={tt}>
                        {t(`layers.text.transforms.${tt}`)}
                    </SelectItem>
                ))}
            </Select>

            {/* Font style */}
            <Select
                label={t("layers.text.font_style")}
                selectedKeys={[value.fontStyle]}
                onSelectionChange={(keys) =>
                    update({ fontStyle: Array.from(keys)[0] })
                }
            >
                {FONT_STYLES.map((fs) => (
                    <SelectItem key={fs}>
                        {t(`layers.text.font_styles.${fs}`)}
                    </SelectItem>
                ))}
            </Select>

            {/* Line height */}
            <InterpolatableInput
                label={t("layers.text.line_height")}
                value={value.lineHeight}
                onChange={(v) => update({ lineHeight: v })}
                unit="px"
                step="0.1"
            />

            {/* Letter spacing */}
            <InterpolatableInput
                label={t("layers.text.letter_spacing")}
                step="0.1"
                value={value.letterSpacing}
                onChange={(v) => update({ letterSpacing: v })}
                unit="px"
            />

        </section>
    );
}
