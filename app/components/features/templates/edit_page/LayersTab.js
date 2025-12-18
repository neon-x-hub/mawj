'use client';
import { useState, useMemo } from 'react';
import { t } from '@/app/i18n';
import { Accordion, AccordionItem } from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import LayerPreview from './panel/preview/LayerPreview';
import { useLayers } from '@/app/lib/layers/context/LayerContext';
import ButtonWithPopover from '@/app/components/core/buttons/AddButtonWithPopover';
import LayerDirectOptions from './panel/layer_control/LayerDirectOptions';
import throttle from '@/app/lib/helpers/throttle';
import { useLedgex } from '@/app/lib/state-ledger/useLedgex';

const LayersTab = () => {
    const { layers, setLayers } = useLayers(); // layers = { base, regular }
    const { set, get } = useLedgex();

    const throttledSet = useMemo(() => throttle(set, 300), [set]);

    // =================== Layer Props Update ===================
    const handlePropsChange = (layerId, newProps) => {
        setLayers(prev => ({
            ...prev,
            regular: prev.regular.map(layer => {
                if (layer.id === layerId) {
                    const updatedLayer = layer.clone();
                    updatedLayer.updateProps(newProps);
                    throttledSet({ [layerId]: updatedLayer.toObject() });
                    return updatedLayer;
                }
                return layer;
            }),
        }));
    };

    // =================== Inline Editing ===================
    const [editingId, setEditingId] = useState(null);
    const [editField, setEditField] = useState(null); // 'title' | 'subtitle'
    const [editText, setEditText] = useState('');

    const startEditing = (id, field, initialValue) => {
        setEditingId(id);
        setEditField(field);
        setEditText(initialValue);
    };

    const commitEdit = () => {
        if (editingId && editField) {
            setLayers(prev => ({
                ...prev,
                regular: prev.regular.map(layer => {
                    if (layer.id === editingId) {
                        const cloned = layer.clone();
                        cloned[editField] = editText;
                        return cloned;
                    }
                    return layer;
                }),
            }));
        }
        setEditingId(null);
        setEditField(null);
        setEditText('');
    };

    const handleKeyDown = (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            commitEdit();
        } else if (e.key === 'Escape') {
            setEditingId(null);
            setEditField(null);
            setEditText('');
        } else if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            e.stopPropagation();
            setEditText(editText + ' ');
        }
    };

    // =================== UI Rendering ===================
    return (
        <Accordion aria-label="layers Accordion">
            {layers.regular?.map(layer => (
                <AccordionItem
                    key={layer.id}
                    aria-label={`Layer ${layer.id}`}
                    title={
                        editingId === layer.id && editField === 'title' ? (
                            <input
                                type="text"
                                value={editText}
                                autoFocus
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                className="font-semibold text-base bg-white px-1 border rounded w-full"
                            />
                        ) : (
                            <span
                                onDoubleClick={() => startEditing(layer.id, 'title', layer.title || '')}
                                className="font-semibold cursor-pointer"
                                title="Double click to edit"
                            >
                                {layer.title || 'Untitled'}
                            </span>
                        )
                    }
                    subtitle={
                        editingId === layer.id && editField === 'subtitle' ? (
                            <input
                                type="text"
                                value={editText}
                                autoFocus
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                className="text-sm text-default-500 bg-white px-1 border rounded w-full"
                            />
                        ) : (
                            <span
                                onDoubleClick={() => startEditing(layer.id, 'subtitle', layer.subtitle || '')}
                                className="text-sm text-default-500 cursor-pointer"
                                title="Double click to edit"
                            >
                                {layer.subtitle || t('messages.layer.no_subtitle')}
                            </span>
                        )
                    }
                    startContent={
                        layer.icon && (
                            <MaskedIcon
                                src={layer.icon}
                                color="black"
                                height="25px"
                                width="25px"
                            />
                        )
                    }
                    indicator={
                        <ButtonWithPopover
                            isOptions
                            PopoverOptions={<LayerDirectOptions layer={layer} />}
                        />
                    }
                >

                    <LayerPreview layer={layer} handlePropsChange={handlePropsChange} />
                    {layer.renderPropertiesPanel((newProps) => handlePropsChange(layer.id, newProps))}
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default LayersTab;
