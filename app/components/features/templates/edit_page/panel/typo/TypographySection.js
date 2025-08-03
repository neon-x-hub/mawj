import React, { useEffect, useState } from 'react';
import { t } from '@/app/i18n';
import { Autocomplete, AutocompleteItem, Select, SelectItem } from '@heroui/react';
import PanelSectionTitle from '../SectionTitle';
import FontSizeInputWithMode from './FontSizeWithMode';
import { loadCustomFont } from '@/app/lib/fonts/fontLoader';

const FALLBACK_FONTS = [
    "Arial", "Helvetica", "Georgia", "Times New Roman",
    "Courier New", "Verdana", "Trebuchet MS", "Comic Sans MS"
];

const FONT_WEIGHTS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
const DECORATIONS = ["none", "underline", "line-through", "overline"];

export default function TypographySection({ value, update }) {
    const [fonts, setFonts] = useState(FALLBACK_FONTS);

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const res = await fetch('/api/v1/fonts');
                if (!res.ok) throw new Error('Failed to fetch fonts');
                const data = await res.json();
                if (Array.isArray(data.data)) setFonts(data.data);
            } catch {
                setFonts(FALLBACK_FONTS);
            }
        };
        fetchFonts();
    }, []);

    const handleFontChange = (fontName) => {
        const fontObj = fonts.find(f => f.name === fontName);
        if (fontObj?.url){
            console.log(fontObj);
            loadCustomFont(fontName, fontObj.url)
        };
        update({ fontFamily: fontName });
    };

    return (
        <section className="flex flex-col gap-3">
            <PanelSectionTitle
                title={t("layers.text.typography")}
                iconSrc={'/icons/haicon/line/text-small-caps.svg'}
                iconOptions={{ height: "19px", width: "19px" }}
            />

            {/* Autocomplete with font previews */}
            <Autocomplete
                label={t("layers.text.fontFamily")}
                selectedKey={value.fontFamily}
                onSelectionChange={handleFontChange}

            >
                {fonts.map(font => (
                    <AutocompleteItem textValue={font.name} key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                        <span>{font.name}</span>
                    </AutocompleteItem>
                ))}
            </Autocomplete>

            <FontSizeInputWithMode
                fontSize={value.fontSize}
                responsiveFont={value.responsiveFont}
                minFontSize={value.minFontSize}
                maxFontSize={value.maxFontSize}
                onChange={val => update({ fontSize: val })}
                onToggle={() => update({ responsiveFont: !value.responsiveFont })}
                onMinMaxChange={patch => update(patch)}
            />

            <Select label={t("layers.text.fontWeight")}
                selectedKeys={[String(value.fontWeight)]}
                onSelectionChange={keys => update({ fontWeight: Array.from(keys)[0] })}>
                {FONT_WEIGHTS.map(w => <SelectItem key={w}>{w}</SelectItem>)}
            </Select>

            <Select label={t("layers.text.decoration")}
                selectedKeys={[value.textDecoration]}
                onSelectionChange={keys => update({ textDecoration: Array.from(keys)[0] })}>
                {DECORATIONS.map(d => <SelectItem key={d}>{t(`layers.text.decorations.${d}`)}</SelectItem>)}
            </Select>
        </section>
    );
}
