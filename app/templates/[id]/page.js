'use client';
import React, { useEffect } from 'react';
import { t } from '@/app/i18n';
import EditorSidebarPanel from '@/app/components/features/templates/edit_page/EditorSideBar';
import Canvas from '@/app/components/features/templates/edit_page/canvas/Canvas';
import { DEFAULT_CONTENT_x2 } from '@/app/components/shared/constants/placeholders';

import { LayersProvider, useLayers } from '@/app/lib/layers/context/LayerContext';

// Layer classes
import { TextLayer, ImageLayer } from '@/app/lib/layers/types';


function EditTemplateInner() {

    const { setLayers } = useLayers();

    useEffect(() => {
        const init_layers = [
            new TextLayer({
                id: '1',
                title: 'My Text Layer 1',
                subtitle: 'A nice old text layer',
                options: {
                    icon: '/icons/coco/line/Text.svg', // optional, can be left out if same as default
                    textProps: {
                        fontFamily: 'Arial',
                        fontSize: 16,
                        color: 'rgba(50, 50, 50, 0.5)',
                        content: 'Sample text 1'
                    },
                },
                canvas: {
                    width: 1920,
                    height: 1080
                }
            }),
            new ImageLayer({
                id: '2',
                title: 'My Image Layer 1',
                subtitle: 'A nice old image layer',
                options: {
                    imageProps: {
                        src: '/data/placeholder/1.jpg',
                    },
                },
                canvas: {
                    width: 1920,
                    height: 1080
                }
            }),
        ];
        setLayers(init_layers);
    }, []);

    return (
        <div className="relative w-full h-full bg-slate-100 overflow-hidden">
            <Canvas />
            <EditorSidebarPanel />
        </div>
    );
}

export default function EditTemplate() {
    return (
        <LayersProvider>
            <EditTemplateInner />
        </LayersProvider>
    );
}
