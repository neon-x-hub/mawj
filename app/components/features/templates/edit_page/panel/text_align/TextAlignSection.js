'use client';

import { t } from '@/app/i18n';
import { RadioGroup, Radio } from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import PanelSectionTitle from '../SectionTitle';

const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'justify'];

const VERTICAL_ALIGNMENTS = [
    { value: 'flex-start', icon: 'top', label: 'top' },
    { value: 'center', icon: 'vertical-center', label: 'center' },
    { value: 'flex-end', icon: 'bottom', label: 'bottom' }
];

const HORIZONTAL_ALIGNMENTS = [
    { value: 'flex-start', icon: 'horizontal-left', label: 'left' },
    { value: 'center', icon: 'horizontal-center', label: 'center' },
    { value: 'flex-end', icon: 'horizontal-right', label: 'right' }
];

export default function TextAlignSection({ value, update }) {
    return (
        <section>
            {/* Section Title */}
            <PanelSectionTitle
                title={t('layers.text.alignment')}
                className="mb-3"
                iconSrc={'/icons/haicon/line/text-align-right-dual.svg'}
                iconOptions={{
                    height: '20px',
                    width: '20px',
                }}
            />

            {/* Text Alignment */}
            <label className="text-sm block my-2">{t('layers.text.textAlignment')}</label>
            <RadioGroup
                orientation="horizontal"
                value={value.textAlign}
                onValueChange={(v) => update({ textAlign: v })}
            >
                {TEXT_ALIGNMENTS.map((align) => (
                    <Radio key={align} value={align} aria-label={align}>
                        <MaskedIcon
                            src={`/icons/haicon/line/text-align-${align}${align === 'justify' ? '-center' : ''}.svg`}
                            color="#0a0a0a"
                            height="20px"
                            width="20px"
                        />
                    </Radio>
                ))}
            </RadioGroup>

            {/* Vertical Content Alignment */}
            <label className="text-sm block my-2 mt-4">{t('layers.text.verticalAlignment')}</label>
            <RadioGroup
                orientation="horizontal"
                value={value.alignItems}
                onValueChange={(v) => update({ alignItems: v })}
            >
                {VERTICAL_ALIGNMENTS.map(({ value, icon, label }) => (
                    <Radio key={value} value={value} aria-label={label}>
                        <MaskedIcon
                            src={`/icons/haicon/line/align-${icon}.svg`}
                            color="#0a0a0a"
                            height="19px"
                            width="19px"
                        />
                    </Radio>
                ))}
            </RadioGroup>

            {/* Horizontal Content Alignment */}
            <label className="text-sm block my-2 mt-4">{t('layers.text.horizontalAlignment')}</label>
            <RadioGroup
                orientation="horizontal"
                value={value.justifyContent}
                onValueChange={(v) => update({ justifyContent: v })}
            >
                {HORIZONTAL_ALIGNMENTS.map(({ value, icon, label }) => (
                    <Radio key={value} value={value} aria-label={label}>
                        <MaskedIcon
                            src={`/icons/haicon/line/align-${icon}.svg`}
                            color="#0a0a0a"
                            height="19px"
                            width="19px"
                        />
                    </Radio>
                ))}
            </RadioGroup>
        </section>
    );
}
