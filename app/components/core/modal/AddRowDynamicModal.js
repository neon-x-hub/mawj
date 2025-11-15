'use client';
import { Textarea } from "@heroui/react";
import React, { useEffect, useState } from "react";
import LivePreviewGenerator from "../../features/projects/live_preview/generateLivePreview";

function AddRowDynamicModal({ projectId, formData, handleInputChange }) {
    const [columns, setColumns] = useState([]);

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
        <div className="space-y-4">

            <LivePreviewGenerator
                projectId={projectId}
                formData={formData}
            />

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

        </div>
    );
}

export default AddRowDynamicModal;
