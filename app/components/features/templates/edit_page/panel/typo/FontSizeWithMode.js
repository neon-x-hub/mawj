'use client';

import { NumberInput, Button, Tooltip } from '@heroui/react';
import { t } from '@/app/i18n';

function parsePx(val) {
    if (typeof val === 'string') return parseInt(val.replace('px', '')) || 0;
    if (typeof val === 'number') return val;
    return 0;
}

function FontSizeInputWithMode({
    fontSize,
    responsiveFont,
    minFontSize,
    maxFontSize,
    onChange,
    onToggle,
    onMinMaxChange
}) {
    const numericValue = parsePx(fontSize);
    const minValue = parsePx(minFontSize);
    const maxValue = parsePx(maxFontSize);

    return (
        <div>
            <label className="text-sm font-medium block mb-1">
                {t('layers.text.fontSize')}
            </label>

            <div className="flex items-center gap-2">
                <NumberInput
                    minValue={6}
                    maxValue={240}
                    value={numericValue}
                    onChange={(num) => onChange(`${num}px`)}
                    isDisabled={responsiveFont}
                    className="flex-1"
                />
                <Tooltip content={responsiveFont ? t("layers.text.autoSize") : t("layers.text.fixedSize")}>
                    <Button
                        variant="light"
                        size="sm"
                        onPress={onToggle}
                    >
                        {responsiveFont ? "Auto" : "px"}
                    </Button>
                </Tooltip>
            </div>

            {responsiveFont && (
                <div className="flex gap-2 mt-2">
                    <NumberInput
                        label="Min"
                        minValue={1}
                        maxValue={maxValue || 200}
                        value={minValue || 10}
                        onChange={(val) => onMinMaxChange({ minFontSize: `${val}px` })}
                        className="flex-1"
                    />
                    <NumberInput
                        label="Max"
                        minValue={minValue || 1}
                        maxValue={500}
                        value={maxValue || 100}
                        onChange={(val) => onMinMaxChange({ maxFontSize: `${val}px` })}
                        className="flex-1"
                    />
                </div>
            )}
        </div>
    );
}

export default FontSizeInputWithMode;
