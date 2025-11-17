'use client';
import { Tabs, Tab, Textarea } from "@heroui/react";
import React, { useState, useMemo } from "react";
import MaskedIcon from "../icons/Icon";
import LivePreviewGenerator from "../../features/projects/live_preview/generateLivePreview";
import { t } from "@/app/i18n";

export default function EditRowDynamicModal({
    project,
    columns,
    formData,
    selectedRow,
    handleInputChange,
}) {
    const [selectedTab, setSelectedTab] = useState("form");

    // 🔥 Build a "merged" object for preview (formData OR fallback to selectedRow)
    const previewData = useMemo(() => {
        const merged = {};
        columns.forEach(col => {
            if (col.key === "status") return;
            merged[col.key] =
                formData[col.key] ??
                selectedRow?.[col.key] ??
                "";
        });
        return merged;
    }, [columns, formData, selectedRow]);

    return (
        <Tabs
            aria-label="Edit Row Options"
            color="primary"
            classNames={{
                tabList: 'bg-gray-300',
                tabContent: 'text-black group-data-[selected=true]:text-white font-medium',
            }}
            onSelectionChange={setSelectedTab}
            selectedKey={selectedTab}
        >
            {/* ---------- FORM TAB ---------- */}
            <Tab
                key="form"
                title={
                    <div className="flex items-center gap-1">
                        <MaskedIcon
                            src="/icons/coco/line/Info.svg"
                            color="currentColor"
                            height="18px"
                            width="18px"
                        />
                        {t('common.data')}
                    </div>
                }
            >
                <form className="space-y-2">
                    {columns
                        .filter(col => col.key !== "status")
                        .map(column => (
                            <div key={column.key}>
                                <label htmlFor={column.key} className="font-medium">
                                    {column.label || column.key}
                                </label>

                                <Textarea
                                    id={column.key}
                                    name={column.key}
                                    value={
                                        formData[column.key] ??
                                        selectedRow?.[column.key] ??
                                        ""
                                    }
                                    onChange={handleInputChange}
                                    placeholder="Update value..."
                                />
                            </div>
                        ))}
                </form>
            </Tab>

            {/* ---------- LIVE PREVIEW TAB ---------- */}
            <Tab
                key="preview"
                title={
                    <div className="flex items-center gap-1">
                        <MaskedIcon
                            src="/icons/coco/line/Eye.svg"
                            color="currentColor"
                            height="18px"
                            width="18px"
                        />
                        {t('common.live_preview')}
                    </div>
                }
            >
                {/* 🔥 Pass merged preview data here */}
                <LivePreviewGenerator
                    project={project}
                    formData={previewData}
                />
            </Tab>
        </Tabs>
    );
}
