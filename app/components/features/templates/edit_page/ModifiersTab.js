'use client';
import { useState } from 'react';
import { t } from '@/app/i18n';
import { Accordion, AccordionItem } from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import { useLayers } from '@/app/lib/layers/context/LayerContext';
import ButtonWithPopover from '@/app/components/core/buttons/AddButtonWithPopover';
import LayerDirectOptions from './panel/layer_control/LayerDirectOptions';

const ModifiersTab = () => {
    const { layers, setLayers } = useLayers(); // layers = { base, regular, modifiers }

    // =================== Inline Editing ===================
    const [editingId, setEditingId] = useState(null);
    const [editField, setEditField] = useState(null);
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
                modifiers: prev.modifiers.map(layer => {
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
        <Accordion aria-label="modifiers Accordion">
            {layers.modifiers?.map(layer => (
                <AccordionItem
                    key={layer.id}
                    aria-label={`Modifier ${layer.id}`}
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
                    {/* ✅ Only properties panel (no preview) */}
                    {layer.renderPropertiesPanel((newProps) => {
                        setLayers(prev => ({
                            ...prev,
                            modifiers: prev.modifiers.map(m => {
                                if (m.id === layer.id) {
                                    const cloned = m.clone();
                                    cloned.updateProps(newProps);
                                    return cloned;
                                }
                                return m;
                            }),
                        }));
                    })}
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default ModifiersTab;
