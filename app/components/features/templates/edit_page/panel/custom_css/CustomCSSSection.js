import React, { useState } from 'react';
import { Textarea, Checkbox } from '@heroui/react';
import { t } from '@/app/i18n';
import PanelSectionTitle from '../SectionTitle';

export default function CustomCSSSection({ value, update }) {
    const [cssCode, setCssCode] = useState(value.customCSS || '');
    const [overwrite, setOverwrite] = useState(value.customCSSOverwrite || false);
    const [isInvalid, setIsInvalid] = useState(false);

    // Simple syntax check: ensure each line ends with ';' or is empty
    const validateCSS = (code) => {
        const lines = code.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && !line.endsWith(';')) return false;
        }
        return true;
    };

    const handleCSSChange = (val) => {
        setCssCode(val);
        const valid = validateCSS(val);
        setIsInvalid(!valid);
        update({
            customCSS: val,
            customCSSOverwrite: overwrite,
        });
    };

    const handleOverwriteChange = (isChecked) => {
        setOverwrite(isChecked);
        update({
            customCSSOverwrite: isChecked,
            customCSS: cssCode,
        });
    };

    return (
        <section className="flex flex-col gap-2">
            <PanelSectionTitle
                title={t("layers.text.custom_css")}
                iconSrc="/icons/haicon/line/brackets-curly.svg"
                iconOptions={{ height: "19px", width: "19px" }}
            />

            <Textarea
                placeholder={t('layers.text.custom_css_placeholder') || 'e.g. filter: brightness(0.8);'}
                value={cssCode}
                onValueChange={handleCSSChange}
                isInvalid={isInvalid}
                errorMessage={isInvalid ? t('layers.text.custom_css_invalid') || 'Invalid CSS syntax.' : ''}
                rows={5}
                style={{ direction: 'ltr' }}
            />

            <div className="mt-2">
                <Checkbox
                    isSelected={overwrite}
                    onValueChange={handleOverwriteChange}
                    classNames={{
                        icon: "after:bg-primary after:text-background text-background"
                    }}
                >
                    {t('layers.text.custom_css_overwrite')}
                </Checkbox>
            </div>

            <div className="mt-2">
                <Checkbox
                    isSelected={value.useTw || false}
                    onValueChange={(val) => {update({ useTw: val });}}
                    classNames={{
                        icon: "after:bg-primary after:text-background text-background"
                    }}
                >
                    {t('layers.text.use_tailwind_css') || 'Use Tailwind CSS'}
                </Checkbox>
            </div>
        </section>
    );
}
