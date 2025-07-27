'use client';
import React from 'react';
import { TransformComponent } from 'react-zoom-pan-pinch';
import Image from 'next/image';
import { useLayers } from '@/app/lib/layers/context/LayerContext';

const IMAGE = {
    src: '/placeholder/1.jpg',
    width: 1920,
    height: 1080,
};

export default function CanvasBody() {
    const { layers } = useLayers();

    const previewWidth = 500;
    const scale = previewWidth / IMAGE.width;

    return (
        <div className="w-full h-full relative">
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                    top: '50vh',
                    left: '10%',
                    width: `${IMAGE.width}px`,
                    height: `${IMAGE.height}px`,
                    transform: `scale(${scale})`, // 💥 只缩放容器
                    transformOrigin: 'top left',
                }}
            >
                <Image
                    src={IMAGE.src}
                    width={IMAGE.width}
                    height={IMAGE.height}
                    alt="preview"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />

                <div className="relative w-full h-full">
                    {layers?.length > 0 &&
                        layers.map((layer) =>
                            layer.renderContent({ node_key: layer.id })
                        )
                    }
                </div>
            </div>
        </div>
    );
}
