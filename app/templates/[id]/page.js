'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { t } from '@/app/i18n';
import EditorSidebarPanel from '@/app/components/features/templates/edit_page/EditorSideBar';
import Canvas from '@/app/components/features/templates/edit_page/canvas/Canvas';
import { useHotkeys } from 'react-hotkeys-hook';
import { buildLayer } from '@/app/lib/layers/types';
import { LayersProvider, useLayers } from '@/app/lib/layers/context/LayerContext';
import { useLedgex } from '@/app/lib/state-ledger/useLedgex';
import SaveButton from '@/app/components/core/buttons/SaveButton';
import { useTemplates } from '@/app/components/context/templates/templatesContext';
import { useDisclosure } from '@heroui/react';
import UploadBaseLayerModal from '@/app/components/core/modal/UploadBaseLayer';

function EditTemplateInner() {
    const { id } = useParams(); // ✅ extract template ID from URL
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { layers, setLayers } = useLayers();
    const { undo, redo, set: setLedgex } = useLedgex();

    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { getTemplateById, updateTemplate } = useTemplates();

    /** ✅ Fetch template using custom hook */
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                console.log("Fetching template with ID:", id);

                const data = await getTemplateById(id);
                console.log('Fetched Template:', data);

                setTemplate(data);
            } catch (err) {
                console.error('❌ Template fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, getTemplateById]);

    /** ✅ Open modal if no base layers exist */
    useEffect(() => {
        if (template?.baseLayers?.length === 0) onOpen();
    }, [template, onOpen]);

    /** ✅ Initialize layers (base + regular) and push regular layers to Ledgex */
    useEffect(() => {
        if (!template) return;

        const regularLayers = (template.layers || []).map(layer => buildLayer(layer.id, layer));

        setLayers({
            base: template.baseLayers || [],
            regular: regularLayers
        });

        // Prepare Ledgex state (only for regular layers)
        const ledgexState = {};
        for (const layer of regularLayers) {
            ledgexState[layer.id] = {
                type: layer.type,
                title: layer.title,
                subtitle: layer.subtitle,
                options: { icon: layer.icon, props: layer.props },
                canvas: layer.canvas
            };
        }
        setLedgex(ledgexState);
    }, [template, setLayers, setLedgex]);

    /** ✅ Undo & Redo handlers */
    const handleUndo = () => {
        const prevState = undo();
        if (!prevState) return;
        setLayers(prev => ({
            ...prev,
            regular: Object.entries(prevState).map(([id, data]) => buildLayer(id, data))
        }));
    };

    const handleRedo = () => {
        const nextState = redo();
        if (!nextState) return;
        setLayers(prev => ({
            ...prev,
            regular: Object.entries(nextState).map(([id, data]) => buildLayer(id, data))
        }));
    };

    /** ✅ Keyboard shortcuts */
    useHotkeys('ctrl+z, meta+z', e => {
        e.preventDefault();
        handleUndo();
    });
    useHotkeys('ctrl+shift+z, meta+shift+z, ctrl+y', e => {
        e.preventDefault();
        handleRedo();
    });

    /** ✅ Loading & Error states */
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                {t('messages.loading')}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-600">
                {t('messages.error_occurred')}: {error}
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                {t('messages.error.no_template_found')}
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-slate-100 overflow-hidden">
            {/* ✅ Modal for uploading base layers (only when baseLayers is empty) */}
            {template.baseLayers?.length === 0 && (
                <UploadBaseLayerModal template={template} isOpen={isOpen} onClose={onClose} />
            )}

            {template && <Canvas template={template} />}

            {/* ✅ Sidebar Panel */}
            <EditorSidebarPanel template={template} />

            {/* ✅ Save Button */}
            <SaveButton
                onPress={async () => {
                    try {
                        // ✅ Convert current layers to serializable objects
                        const LayersExport = layers.regular.map(layer => layer.toObject());
                        console.log('Layers Export:', LayersExport);

                        // ✅ Call updateTemplate to persist layer changes
                        await updateTemplate(template.id, { layers: LayersExport });

                        console.log('✅ Template layers updated successfully');
                    } catch (err) {
                        console.error('❌ Failed to save layers:', err);
                    }
                }}
            />

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
