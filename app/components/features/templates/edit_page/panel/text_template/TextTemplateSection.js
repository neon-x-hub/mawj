import React, { useState } from 'react';
import { t } from '@/app/i18n';
import { Input, Textarea } from '@heroui/react';
import PanelSectionTitle from '../SectionTitle';
import { direction } from 'direction';


export default function TextTemplateSection({ value, update }) {
    return (
        <section className="flex flex-col gap-3">
            <PanelSectionTitle
                title={t("layers.text.template")}
                iconSrc="/icons/haicon/line/brackets-curly.svg"
                iconOptions={{ height: "19px", width: "19px" }}
            />

            <Textarea
                placeholder={t("layers.text.template_placeholder")}
                value={value.templateText}
                onValueChange={(value) => update({ templateText: value })}
                style={{
                    direction: direction(value.templateText) === 'ltr' ? 'ltr' : 'rtl',
                }}
            />
        </section>
    );
}
