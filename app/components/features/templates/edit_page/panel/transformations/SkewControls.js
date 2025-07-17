'use client';

import { NumberInput } from "@heroui/react";

export default function SkewControls({ value, update }) {
    return (
        <div className="flex gap-3">
            <NumberInput
                label="X"
                value={value.skewX}
                minValue={-90}
                maxValue={90}
                defaultValue={0}
                onValueChange={(skewX) => update({ skewX })}
                className="flex-1"
            />
            <NumberInput
                label="Y"
                value={value.skewY}
                minValue={-90}
                maxValue={90}
                defaultValue={0}
                onValueChange={(skewY) => update({ skewY })}
                className="flex-1"
            />
        </div>
    );
}
