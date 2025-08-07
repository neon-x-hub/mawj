"use client";

import React from "react";
import {
    Card,
    CardBody,
    Divider
} from "@heroui/react";
import { t, getLang } from "@/app/i18n";
// Sections
import TransformSection from "@/app/components/features/templates/edit_page/panel/transformations/TransformSection";
import TextAlignSection from "../../features/templates/edit_page/panel/text_align/TextAlignSection";
import TypographySection from "../../features/templates/edit_page/panel/typo/TypographySection";
import ColorSection from "../../features/templates/edit_page/panel/colors/ColorSection";
import TextTemplateSection from "../../features/templates/edit_page/panel/text_template/TextTemplateSection";

export const TextPropertiesPanel = ({ value, onChange }) => {

    const update = (patch) => onChange({ ...value, ...patch });

    return (
        <Card className="w-full" >
            <CardBody className={`flex flex-col gap-6 ${getLang() === "ar" ? "text-right" : ""} `}>
                {/* Section: Text Template */}
                <TextTemplateSection value={value} update={update} />
                <Divider />

                {/* Section: Transformations */}
                <TransformSection value={value} update={update} />
                <Divider />
                {/* Section: Alignment */}
                <TextAlignSection value={value} update={update} />
                <Divider />


                {/* Section: Typography */}
                <TypographySection value={value} update={update} />
                <Divider />

                {/* Section: Colors */}
                <ColorSection value={value} update={update} />

            </CardBody>
        </Card>
    );
};


export default TextPropertiesPanel;
