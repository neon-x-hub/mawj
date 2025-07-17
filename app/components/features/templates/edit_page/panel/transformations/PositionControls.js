'use client';

import { useState } from 'react';
import { NumberInput, Button } from '@heroui/react';

export default function PositionControls({
    value, // expects: { top: '10px', left: '50%' }
    update, // function to update parent: (patch) => void
    defaultUnits = { x: 'px', y: 'px' },
}) {
    const [units, setUnits] = useState(defaultUnits);

    const axisMap = {
        x: 'left',
        y: 'top',
    };

    const toggleUnit = (axis) => {
        const cssProp = axisMap[axis];
        const currentUnit = units[axis];
        const nextUnit = currentUnit === 'px' ? '%' : 'px';

        const numericValue = parseFloat(value[cssProp]) || 0;
        update({ [cssProp]: `${numericValue}${nextUnit}` });

        setUnits((prev) => ({
            ...prev,
            [axis]: nextUnit,
        }));
    };

    const handleValueChange = (axis, num) => {
        const cssProp = axisMap[axis];
        const unit = units[axis];
        update({ [cssProp]: `${num}${unit}` });
    };

    return (
        <div className="flex gap-3">
            {['x', 'y'].map((axis) => {
                const cssProp = axisMap[axis];
                const numericValue = parseFloat(value[cssProp]) || 0;
                const unit = units[axis];

                return (
                    <NumberInput
                        key={axis}
                        label={axis.toUpperCase()}
                        value={numericValue}
                        onValueChange={(num) => handleValueChange(axis, num)}
                        className="flex-1"
                        endContent={
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => toggleUnit(axis)}
                            >
                                {unit}
                            </Button>
                        }
                    />
                );
            })}
        </div>
    );
}
