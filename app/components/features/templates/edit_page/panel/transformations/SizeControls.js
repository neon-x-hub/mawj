'use client';

import { useState } from 'react';
import { NumberInput, Button } from '@heroui/react';

export default function SizeControls({ value, update, defaultUnits = { w: 'px', h: 'px' } }) {
    const [units, setUnits] = useState(defaultUnits);

    const axisMap = { w: 'width', h: 'height' };

    const toggleUnit = (axis) => {
        const cssProp = axisMap[axis];
        const currentUnit = units[axis];
        const nextUnit = currentUnit === 'px' ? '%' : 'px';

        const numeric = parseFloat(value[cssProp]) || 0;
        update({ [cssProp]: `${numeric}${nextUnit}` });

        setUnits((prev) => ({ ...prev, [axis]: nextUnit }));
    };

    const handleChange = (axis, num) => {
        const cssProp = axisMap[axis];
        update({ [cssProp]: `${num}${units[axis]}` });
    };

    return (
        <div className="flex gap-3">
            {['w', 'h'].map((axis) => {
                const cssProp = axisMap[axis];
                const numeric = parseFloat(value[cssProp]) || 0;
                return (
                    <NumberInput
                        key={axis}
                        label={axis.toUpperCase()}
                        value={numeric}
                        onValueChange={(num) => handleChange(axis, num)}
                        className="flex-1"
                        endContent={
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => toggleUnit(axis)}
                            >
                                {units[axis]}
                            </Button>
                        }
                    />
                );
            })}
        </div>
    );
}
