'use client';
import React, { useState } from 'react';
import CanvasBody from './CanvasBody';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ZoomControls from './ZoomControls';
import UploadBaseLayerModal from '@/app/components/core/modal/UploadBaseLayer';

export default function Canvas({ template }) {
    const [isChangeBaseModalOpen, setChangeBaseModalOpen] = useState(false);

    return (
        <>
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: false }}
                pinch={{ step: 5 }}
                panning={{
                    velocityDisabled: true,
                    limitToWrapperBounds: false
                }}
                limitToBounds
                centerZoomedOut
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        {/* ✅ Pass handler to open modal */}
                        <ZoomControls
                            zoomIn={zoomIn}
                            zoomOut={zoomOut}
                            resetTransform={resetTransform}
                            onChangeBaseLayer={() => setChangeBaseModalOpen(true)}
                        />

                        <TransformComponent
                            wrapperStyle={{ width: '100%', height: '100%' }}
                            contentStyle={{
                                width: '300%',
                                height: '300%',
                                backgroundImage: 'url("/bg/grid/dot-6.jpg")',
                                backgroundRepeat: 'repeat',
                                backgroundSize: '500px 500px',
                                backgroundPosition: 'center center',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                        >
                            <CanvasBody template={template} />
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>

            {/* ✅ Modal for changing base layer (force=false so it can be canceled) */}
            <UploadBaseLayerModal
                template={template}
                isOpen={isChangeBaseModalOpen}
                onClose={() => setChangeBaseModalOpen(false)}
                force={false}
            />
        </>
    );
}
