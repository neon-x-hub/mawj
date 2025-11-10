"use client";

import React from "react";
import { Card, CardBody, NumberInput, Divider } from "@heroui/react";
import { t, getLang } from "@/app/i18n";

export const FadePropertiesPanel = ({ value, onChange }) => {

    const update = (patch) => onChange({ ...value, ...patch });

    return (
        <Card className="w-full">
            <CardBody className={`flex flex-col gap-6 ${getLang() === "ar" ? "text-right" : ""}`}>

                {/* Fade-In Duration */}
                <h2 className="text-base font-medium flex items-center gap-2">
                    {t("modifiers.fade.fadeInDuration")}
                </h2>
                <NumberInput
                    minValue={0}
                    hideStepper
                    placeholder={t("modifiers.fade.enterFadeIn")}
                    value={value.fadeInDuration || 0}
                    onValueChange={(val) => update({ fadeInDuration: val })}
                    step={0.1}
                    className="max-w-xs"
                />

                <Divider />

                {/* Fade-Out Duration */}
                <h2 className="text-base font-medium flex items-center gap-2">
                    {t("modifiers.fade.fadeOutDuration")}
                </h2>
                <NumberInput
                    minValue={0}
                    hideStepper
                    placeholder={t("modifiers.fade.enterFadeOut")}
                    value={value.fadeOutDuration || 0}
                    onValueChange={(val) => update({ fadeOutDuration: val })}
                    step={0.1}
                    className="max-w-xs"
                />

            </CardBody>
        </Card>
    );
};

export default FadePropertiesPanel;
