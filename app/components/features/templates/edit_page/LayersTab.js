'use client';
import { useState } from 'react';
import { t } from '@/app/i18n';
import { Accordion, AccordionItem } from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import LayerPreview from './panel/preview/LayerPreview';
import { useLayers } from '@/app/lib/layers/context/LayerContext';


const LayersTab = () => {

    const { layers, setLayers } = useLayers();

    const handlePropsChange = (layerId, newProps) => {
        setLayers(prevLayers =>
            prevLayers.map(layer => {
                if (layer.id === layerId) {
                    const updatedLayer = layer.clone();
                    updatedLayer.updateProps(newProps);
                    return updatedLayer;
                }
                return layer;
            })
        );
    };

    return (
        <Accordion aria-label="layers Accordion">
            {layers.map((layer) => (
                <AccordionItem
                    key={layer.id}
                    aria-label={`Layer ${layer.id}`}
                    subtitle={layer.subtitle}
                    title={layer.title}
                    startContent={layer.icon && (
                        <MaskedIcon
                            src={layer.icon}
                            color="black"
                            height="25px"
                            width="25px"
                        />
                    )}
                    classNames={{ title: 'font-semibold' }}
                >

                    <LayerPreview layer={layer} handlePropsChange={handlePropsChange} />

                    {layer.renderPropertiesPanel((newProps) =>
                        handlePropsChange(layer.id, newProps)
                    )}
                </AccordionItem>

            ))}
        </Accordion>
    );
};

export default LayersTab;
