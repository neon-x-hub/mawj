import React from 'react'
import CanvasBody from './CanvasBody'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
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
                            <CanvasBody />
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </>
    )
}
