'use client';
import React from 'react';
import { Slider } from '@heroui/react';

export default function RotationSlider({ value, update }) {
    // Parse number from value string (e.g., '123deg' → 123)
    const numericValue = parseFloat(value) || 0;

    const handleChange = (val) => {
        // In case val is an array, extract first item
        const num = Array.isArray(val) ? val[0] : val;
        update({ rotation: `${num}deg` });
    };

    return (
        <>
            <Slider
                minValue={0}
                maxValue={360}
                step={1}
                value={numericValue}
                onChange={handleChange}
                size="lg"
                style={{ direction: 'ltr' }}
            />
            <p>{numericValue} °</p>
        </>
    );
}
