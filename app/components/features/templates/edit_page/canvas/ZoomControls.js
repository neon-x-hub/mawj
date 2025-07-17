'use client';

const ZoomControls = ({ zoomIn, zoomOut, resetTransform }) => (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button onClick={zoomIn} className="p-2 bg-white rounded">
            Zoom In
        </button>
        <button onClick={zoomOut} className="p-2 bg-white rounded">
            Zoom Out
        </button>
        <button onClick={resetTransform} className="p-2 bg-white rounded">
            Reset
        </button>
    </div>
);

export default ZoomControls;
