'use client';

import { t } from "@/app/i18n";
import MaskedIcon from "@/app/components/core/icons/Icon";
import { Button } from "@heroui/react";

const ZoomControls = ({ zoomIn, zoomOut, resetTransform }) => {
    const buttons = [
        {
            label: t('actions.zoom_in'),
            icon: "/icons/coco/line/Zoom-In.svg",
            action: zoomIn,
        },
        {
            label: t('actions.zoom_out'),
            icon: "/icons/coco/line/Zoom-Out.svg",
            action: zoomOut,
        },
        {
            label: t('actions.reset'),
            icon: "/icons/coco/line/Rotate.svg",
            action: resetTransform,
        },
    ];

    const handlePress = (action) => action && action();

    return (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
            {buttons.map(({ label, icon, action }) => (
                <Button
                    key={label}
                    onPress={() => handlePress(action)}
                    className="p-2 bg-gray-500/40 font-medium backdrop-blur-md"
                    endContent={<MaskedIcon src={icon} color="black" height="18px" width="18px" />}
                    size="sm"
                >
                    {label}
                </Button>
            ))}
        </div>
    );
};

export default ZoomControls;
