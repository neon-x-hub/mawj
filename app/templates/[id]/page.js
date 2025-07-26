'use client';
import React, { useEffect } from 'react';
import { t } from '@/app/i18n';
import EditorSidebarPanel from '@/app/components/features/templates/edit_page/EditorSideBar';
import Canvas from '@/app/components/features/templates/edit_page/canvas/Canvas';
// hotkeys
import { useHotkeys } from "react-hotkeys-hook";
// build layers
import { buildLayer } from '@/app/lib/layers/types';

import { LayersProvider, useLayers } from '@/app/lib/layers/context/LayerContext';

import { Button } from '@heroui/react';
// Layer classes
import { TextLayer, ImageLayer } from '@/app/lib/layers/types';

import { useLedgex } from '@/app/lib/state-ledger/useLedgex';
import MaskedIcon from '@/app/components/core/icons/Icon';

function EditTemplateInner() {

    const { setLayers } = useLayers();
    const { undo, redo, set } = useLedgex();


    useEffect(() => {
        const init_layers = [
            new TextLayer({
                id: '1',
                title: 'My Text Layer 1',
                subtitle: 'A nice old text layer',
                options: {
                    icon: '/icons/coco/line/Text.svg',
                    props: {
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
                    props: {
                        src: '/data/placeholder/1.jpg',
                    },
                },
                canvas: {
                    width: 1920,
                    height: 1080
                }
            }),
        ];

        // ✅ Set initial layers to your context
        setLayers(init_layers);

        // ✅ Prepare plain objects for Ledgex
        const ledgexState = {};
        for (const layer of init_layers) {
            ledgexState[layer.id] = {
                type: layer.type,         // each layer class must define type
                title: layer.title,
                subtitle: layer.subtitle,
                options: {
                    icon: layer.icon,
                    props: layer.props
                },       // unified props
                canvas: layer.canvas
            };
        }

        // ✅ Push the initial state to Ledgex
        set(ledgexState);
    }, []);


    function rebuildLayersFromLedgex(ledgexState) {
        return Object.entries(ledgexState).map(([id, data]) => buildLayer(id, data));
    }

    const handleUndo = () => {
        const prevState = undo();
        const prevLayers = rebuildLayersFromLedgex(prevState);
        setLayers(prevLayers);
    };

    const handleRedo = () => {
        const prevState = redo();
        const prevLayers = rebuildLayersFromLedgex(prevState);
        setLayers(prevLayers);
    };

    // ✅ Register shortcuts
    useHotkeys("ctrl+z, meta+z", (e) => {
        //e.stopPropagation();
        e.preventDefault();
        handleUndo();
    });

    useHotkeys("ctrl+shift+z, meta+shift+z, ctrl+y", (e) => {
        //e.stopPropagation();
        e.preventDefault();
        handleRedo();
    });

    return (
        <div className="relative w-full h-full bg-slate-100 overflow-hidden">
            <Canvas />
            <EditorSidebarPanel />
            <Button
                color='primary'
                startContent={
                    <MaskedIcon
                        src="/icons/hugeicons/line/floppy-disk.svg"
                        color="#ffffff"
                        height='22px'
                        width='22px'
                    />
                }
                className='absolute bottom-6 left-6 z-50'
            >
                <span className='font-normal text-lg text-white'>
                    {t('actions.save')}
                </span>
            </Button>
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
