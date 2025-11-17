'use client';
import React, { useEffect, useState } from "react";
import { t } from "@/app/i18n";
import { Button, Skeleton } from "@heroui/react";
import { useTemplates } from "@/app/components/context/templates/templatesContext";
import MaskedIcon from "@/app/components/core/icons/Icon";
import Image from "next/image";

export default function LivePreviewGenerator({ project, formData }) {
    const { getTemplateById } = useTemplates();
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [template, setTemplate] = useState(null);

    useEffect(() => {
        async function fetchTemplate() {
            try {
                const tpl = await getTemplateById(project.template);
                setTemplate(tpl);
            } catch (err) {
                console.error("Error fetching template:", err);
            }
        }
        if (project?.template) fetchTemplate();
    }, [project]);

    const baseLayer = template?.baseLayers?.[0];
    const aspectRatio = baseLayer?.width && baseLayer?.height
        ? baseLayer.width / baseLayer.height
        : 16 / 9;

    const isVertical = aspectRatio < 1;

    async function handleGeneratePreview() {
        try {
            setLoadingPreview(true);
            setPreviewData(null);

            const response = await fetch(`/api/v1/projects/${project.id}/live_preview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ params: formData })
            });

            if (!response.ok) {
                console.error("Preview generation failed");
                return;
            }

            await response.json();
            setPreviewData({ url: `/api/v1/projects/${project.id}/live_preview` });

        } catch (err) {
            console.error("Error generating live preview:", err);
        } finally {
            setLoadingPreview(false);
        }
    }

    if (!template) return <Skeleton className="w-full h-64 rounded-xl" />;

    return (
        <div className="w-full flex flex-col items-center space-y-3 mb-5 p-4 rounded-xl bg-[url('/bg/grid/square-2.jpg')] bg-repeat bg-center bg-[length:450px_450px]">

            {/* Media Container */}
            <div
                className="rounded-xl border relative flex justify-center items-center"
                style={{
                    aspectRatio: aspectRatio,
                    width: isVertical ? "50%" : "100%",
                    maxWidth: isVertical ? "260px" : "100%",
                    maxHeight: isVertical ? "100%" : "300px",
                }}
            >
                {/* Refresh Button */}
                <div className="absolute top-1 left-1 z-10">
                    <Button
                        color="primary"
                        onPress={handleGeneratePreview}
                        isLoading={loadingPreview}
                        size="sm"
                        radius="full"
                        endContent={<MaskedIcon src="/icons/coco/line/rotate.svg" color="#ffffff" height="15px" width="15px" />}
                        className="text-white scale-85"
                    >
                        {t('actions.refresh')}
                    </Button>
                </div>

                {/* Loading skeleton */}
                {(loadingPreview || !previewData) && (
                    <Skeleton
                        className="w-full h-full rounded-xl border"
                        style={{
                            aspectRatio: aspectRatio
                        }}
                    />
                )}

                {/* Final Media */}
                {previewData && !loadingPreview && (
                    project.type === "video" ? (
                        <video
                            src={previewData.url}
                            controls
                            autoPlay
                            className="w-full h-full object-contain rounded-xl"
                        />
                    ) : (
                        <Image
                            src={previewData.url}
                            alt="Live Preview"
                            fill
                            className="object-contain rounded-xl"
                        />
                    )
                )}
            </div>
        </div>
    );
}
