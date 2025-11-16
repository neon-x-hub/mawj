'use client';
import { Textarea, Tabs, Tab } from "@heroui/react";
import React, { useEffect, useState } from "react";
import LivePreviewGenerator from "../../features/projects/live_preview/generateLivePreview";
import MaskedIcon from "../icons/Icon";
import { t } from "@/app/i18n";

function AddRowDynamicModal({ project, formData, handleInputChange }) {
    const projectId = project.id;
    const [columns, setColumns] = useState([]);
    const [selectedTab, setSelectedTab] = useState("form"); // default selected tab

    useEffect(() => {
        async function fetchColumns() {
            try {
                const response = await fetch(`/api/v1/projects/${projectId}/data/metadata`);
                if (!response.ok) throw new Error("Failed to fetch metadata");
                const json = await response.json();
                setColumns(json.columns || []);
            } catch (error) {
                console.error("Error fetching columns:", error);
            }
        }

        fetchColumns();
    }, [projectId]);

    if (columns.length === 0) return <div>Loading...</div>;

    return (
        <Tabs
            aria-label="Add Row Options"
            color="primary"
            classNames={{
                tabList: 'bg-gray-300',
                tabContent: 'text-black group-data-[selected=true]:text-white font-medium',
            }}
            onSelectionChange={setSelectedTab}
            selectedKey={selectedTab}
        >
            {/* Form Tab */}
            <Tab
                key="form"
                title={
                    <div className="flex items-center gap-1">
                        <MaskedIcon
                            src={'/icons/coco/line/Info.svg'}
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
                            <div key={column}>
                                <label htmlFor={column}>{column}</label>
                                <Textarea
                                    id={column}
                                    name={column}
                                    value={formData[column] || ""}
                                    onChange={handleInputChange}
                                    placeholder="..."
                                />
                            </div>
                        ))}
                </form>
            </Tab>

            {/* Live Preview Tab */}
            <Tab
                key="preview"
                title={
                    <div className="flex items-center gap-1">
                        <MaskedIcon
                            src={'/icons/coco/line/Eye.svg'}
                            color="currentColor"
                            height="18px"
                            width="18px"
                        />
                        {t('common.live_preview')}
                    </div>
                }
            >
                <LivePreviewGenerator
                    project={project}
                    formData={formData}
                />
            </Tab>
        </Tabs>
    );
}

export default AddRowDynamicModal;
