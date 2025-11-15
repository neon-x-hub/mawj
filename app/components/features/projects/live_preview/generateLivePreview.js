'use client';
import React, { useState } from "react";
import { Button } from "@heroui/react";

export default function LivePreviewGenerator({ projectId, formData }) {
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewReady, setPreviewReady] = useState(false);

    async function handleGeneratePreview() {
        try {
            setLoadingPreview(true);
            setPreviewReady(false);

            const response = await fetch(`/api/v1/projects/${projectId}/live_preview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ params: formData })
            });

            if (!response.ok) {
                console.error("Preview generation failed");
                return;
            }

            setPreviewReady(true);

        } catch (err) {
            console.error("Error generating live preview:", err);
        } finally {
            setLoadingPreview(false);
        }
    }

    const previewUrl = `/api/v1/projects/${projectId}/live_preview`;

    return (
        <div className="w-full flex items-center flex-col space-y-3 mb-5">
            {previewReady && (
                <video
                    src={previewUrl}
                    controls
                    autoPlay
                    className="h-[300px] rounded-xl border"
                />
            )}

            <Button
                color="primary"
                onPress={handleGeneratePreview}
                isLoading={loadingPreview}
            >
                Generate Live Preview
            </Button>
        </div>
    );
}
