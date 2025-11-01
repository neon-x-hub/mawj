"use client";

import React from "react";
import { Card, CardBody, Textarea, Divider } from "@heroui/react";
import { t, getLang } from "@/app/i18n";
import { direction } from "direction";

export const BGCTRLPropertiesPanel = ({ value, onChange }) => {

    const update = (patch) => onChange({ ...value, ...patch });

    return (
        <Card className="w-full">
            <CardBody className={`flex flex-col gap-6 ${getLang() === "ar" ? "text-right" : ""}`}>

                {/* Template Textarea */}
                <h2 className={`text-base font-medium flex items-center gap-2`}>
                    {t("modifiers.bgctrl.template")}
                </h2>
                <Textarea
                    placeholder={t("modifiers.bgctrl.enterTemplate")}
                    value={value.template || ""}
                    onChange={(e) => update({ template: e.target.value })}
                    minRows={4}
                    style={{
                        direction: direction(value.template) === 'ltr' ? 'ltr' : 'rtl',
                    }}
                />

                {/* Playback Settings Textarea */}
                <Divider />
                <h2 className={`text-base font-medium flex items-center gap-2`}>
                    {t("modifiers.bgctrl.playbackSettings")}
                </h2>
                <Textarea
                    placeholder={t("modifiers.bgctrl.enterPlaybackSettings")}
                    value={value.playbackSettings || ""}
                    onChange={(e) => update({ playbackSettings: e.target.value })}
                    minRows={4}
                    style={{
                        direction: direction(value.playbackSettings) === 'ltr' ? 'ltr' : 'rtl',
                    }}
                />
            </CardBody>
        </Card>
    );
};

export default BGCTRLPropertiesPanel;
