import React, { useState, useEffect } from "react";
import { NumberInput, Textarea } from "@heroui/react";
import { direction } from "direction";
import InterpolationRecipeParser from "@/app/lib/interpolation/parser";
import MaskedIcon from "../icons/Icon";

const interpolationIcon = (
    <MaskedIcon
        src="/icons/coco/line/Connected-Chart.svg"
        width="18px"
        height="18px"
        color="#6b7280"
    />
);

const numericIcon = (
    <MaskedIcon
        src="/icons/coco/line/Celular-box.svg"
        width="18px"
        height="18px"
        color="#6b7280"
    />
);

export function InterpolatableInput({
    label,
    value,
    onChange,
    unit = "px",
    minValue = 0,
    maxValue = 300,
    ...props
}) {
    const isInterpolationObject =
        value && typeof value === "object" && value.type === "interpolation";

    const [mode, setMode] = useState(isInterpolationObject ? "interpolation" : "simple");
    const [textValue, setTextValue] = useState(
        isInterpolationObject ? serializeRecipe(value) : ""
    );
    const [validation, setValidation] = useState({ success: true, errors: [] });

    useEffect(() => {
        if (mode === "interpolation") {
            const result = InterpolationRecipeParser.test(textValue);
            setValidation(result);
            if (result.success && result.result) {
                onChange(result.result);
            }
        }
    }, [textValue, mode]);

    const handleNumberChange = (num) => {
        onChange(`${num}${unit}`);
    };

    const toggleMode = () => {
        if (mode === "simple") {
            setMode("interpolation");
            setTextValue(`10 -> 72\n40 -> 48\nunit: ${unit}\nconsider_diacritics`);
        } else {
            setMode("simple");
            onChange(`72${unit}`);
        }
    };

    const ToggleIcon = (
        <button
            type="button"
            onClick={toggleMode}
            style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "1.75rem",
                height: "1.75rem",
            }}
        >
            {mode === "simple" ? (
                numericIcon
            ) : (
                interpolationIcon
            )}
        </button>
    );

    return (
        <div className="flex flex-col gap-1 max-w-sm">

            {mode === "simple" ? (
                <NumberInput
                    minValue={minValue}
                    maxValue={maxValue}
                    value={extractNumeric(value)}
                    onChange={handleNumberChange}
                    startContent={ToggleIcon}
                    endContent={<span className="text-gray-400">{unit}</span>}
                    className="flex-1"
                    label={label}
                    {...props}
                />
            ) : (
                <Textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder={`10 -> 72\n40 -> 48\nunit: ${unit}`}
                    minRows={3}
                    label={label}
                    startContent={ToggleIcon}
                    isInvalid={!validation.success}
                    errorMessage={
                        !validation.success && validation.errors.length > 0
                            ? validation.errors.join("\n")
                            : undefined
                    }
                    style={{
                        direction: direction(textValue) === "rtl" ? "rtl" : "ltr",
                    }}
                    {...props}
                />
            )}
        </div>
    );
}

/** Helpers **/

function extractNumeric(value) {
    if (typeof value === "string") {
        const match = value.match(/([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }
    return typeof value === "number" ? value : 0;
}

function serializeRecipe(obj) {
    if (!obj || !obj.points) return "";
    const lines = obj.points.map(p => `${p.x} -> ${p.y}`);
    if (obj.unit) lines.push(`unit: ${obj.unit}`);
    if (obj.consider_diacritics) lines.push("consider_diacritics");
    return lines.join("\n");
}
