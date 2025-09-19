'use client';
import { t } from "@/app/i18n";
import { Textarea } from "@heroui/react";
import React, { useEffect, useState } from "react";

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
        <form className="space-y-2">
            {columns
                .filter((col) => col.key !== "status")
                .map((column) => (
                    <div key={column}>
                        <label htmlFor={column}>{column}</label>
                        <Textarea
                            type="text"
                            id={column}
                            name={column}
                            value={formData[column] || ""}
                            onChange={handleInputChange}
                            placeholder='...'
                        />
                    </div>
                ))}
        </form>
    );
}

export default AddRowDynamicModal;
