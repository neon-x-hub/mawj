'use client';

import { useMemo } from 'react';
import RGBA from '@/app/lib/helpers/colors/rgba';
import { RgbaColorPicker } from 'react-colorful';
import { Input } from '@heroui/react';


export default function ColorPickerSection({ color, onChange, label }) {
    // ---------- Parse/validate only when `color` changes ----------
    const { parsedColor, error } = useMemo(() => {
        try {
            return { parsedColor: RGBA.fromCSS(color), error: '' };
        } catch {
            return {
                parsedColor: new RGBA({ r: 0, g: 0, b: 0, a: 1 }),
                error: 'Please enter a valid RGBA color (e.g., rgba(0, 0, 0, 0.5))',
            };
        }
    }, [color]);

    // ---------- Handlers ----------
    const handlePickerChange = (c) => {
        const newColor = new RGBA(c).toCSS();
        if (newColor !== color) {
            onChange(newColor);           // delegate to parent
        }
    };

    const handleInputChange = (e) => {
        onChange(e.target.value);       // raw string; parent decides what to do
    };

    // ---------- UI ----------
    return (
        <div className="react-colorful-container">
            {label && (
                <label className="text-sm block mb-1">{label}</label>
            )}

            <RgbaColorPicker
                color={parsedColor}
                onChange={handlePickerChange}
                className="w-full mb-2"
            />


            <Input
                type="text"
                value={color}
                onChange={handleInputChange}
                errorMessage={error}
                isInvalid={!!error}
            />
        </div>
    );
}
