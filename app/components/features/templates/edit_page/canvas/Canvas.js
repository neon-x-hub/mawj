import React from 'react'
import CanvasBody from './CanvasBody'
import { TransformWrapper } from 'react-zoom-pan-pinch'
import ZoomControls from './ZoomControls'


export default function Canvas() {
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

                        <ZoomControls
                            zoomIn={zoomIn}
                            zoomOut={zoomOut}
                            resetTransform={resetTransform}
                        />

                        <CanvasBody/>
                    </>
                )}
            </TransformWrapper>
        </>
    )
}
