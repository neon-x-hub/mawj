'use client';

// I18N
import { t } from "@/app/i18n";

import MaskedIcon from "@/app/components/core/icons/Icon";
import { Button } from "@heroui/react";

const ZoomControls = ({ zoomIn, zoomOut, resetTransform }) => (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button onClick={zoomIn}
            className="p-2 bg-gray-500/40 font-medium backdrop-blur-md"
            endContent={
                <MaskedIcon
                    src="/icons/coco/line/Zoom-In.svg"
                    color="black"
                    height="18px"
                    width="18px"
                />
            }
            size="sm"
        >
            {t('actions.zoom_in')}
        </Button>
        <Button onClick={zoomOut}
            className="p-2 bg-gray-500/40 font-medium backdrop-blur-md"
            endContent={
                <MaskedIcon
                    src="/icons/coco/line/Zoom-Out.svg"
                    color="black"
                    height="18px"
                    width="18px"
                />
            }
            size="sm"
        >
            {t('actions.zoom_out')}
        </Button>
        <Button onClick={resetTransform}
            className="p-2 bg-gray-500/40 font-medium backdrop-blur-md"
            endContent={
                <MaskedIcon
                    src="/icons/coco/line/Rotate.svg"
                    color="black"
                    height="18px"
                    width="18px"
                />
            }
            size="sm"
        >
            {t('actions.reset')}
        </Button>
    </div>
);

export default ZoomControls;
