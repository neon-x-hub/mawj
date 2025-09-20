"use client";

import React from "react";
import {
    Card,
    CardBody,
    Divider
} from "@heroui/react";
import { t, getLang } from "@/app/i18n";
// Sections
import TextTemplateSection from "../../features/templates/edit_page/panel/text_template/TextTemplateSection";

export const RichPropertiesPanel = ({ value, onChange }) => {

    const update = (patch) => onChange({ ...value, ...patch });

    return (
        <Card className="w-full" >
            <CardBody className={`flex flex-col gap-6 ${getLang() === "ar" ? "text-right" : ""} `}>
                {/* Section: Text Template */}
                <TextTemplateSection value={value} update={update} />
                <Divider />

            </CardBody>
        </Card>
    );
};


export default RichPropertiesPanel;
