'use client';
import React from 'react';
import Image from 'next/image';
import { useLayers } from '@/app/lib/layers/context/LayerContext';
import { useParams } from 'next/navigation';

export default function CanvasBody({ template }) {
    const { layers } = useLayers();
    const { id } = useParams();

    const baseLayer = layers.base?.[0]; // ✅ safely get first base layer
    if (!baseLayer) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
                No base layer available
            </div>
        );
    }

    // ✅ Scale the preview to a fixed width
    const previewWidth = 500;
    const scale = baseLayer.width ? previewWidth / baseLayer.width : 1;

    return (
        <div className="w-full h-full relative">
            <div
                className="absolute"
                style={{
                    top: '50vh',
                    left: '10%',
                    width: `${baseLayer.width}px`,
                    height: `${baseLayer.height}px`,
                    transform: `scale(${scale}) translate(-50%, -50%)`,
                    transformOrigin: 'top left'
                }}
            >
                {/* ✅ Correct API path matches your GET route */}
                <Image
                    src={`/api/v1/templates/${id}/base/${baseLayer.name}`}
                    width={baseLayer.width}
                    height={baseLayer.height}
                    alt={baseLayer.name || 'Base Layer'}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />{/* Not fetching the image, maybe we need to  */}

                {/* ✅ Render other layers */}
                <div className="relative w-full h-full">
                    {layers.regular?.map((layer) =>
                        layer.renderContent({ node_key: layer.id })
                    )}
                </div>
            </div>
        </div>
    );
}
