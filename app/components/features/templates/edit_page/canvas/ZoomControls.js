'use client';

import { t } from "@/app/i18n";
import MaskedIcon from "@/app/components/core/icons/Icon";
import { Button } from "@heroui/react";

const ZoomControls = ({ zoomIn, zoomOut, resetTransform, onChangeBaseLayer }) => {
    const buttons = [
        {
            label: t('actions.change_base_layer'),
            icon: "/icons/coco/line/Gallery.svg",
            action: onChangeBaseLayer,
            color: "blue",
        },
        {
            label: t('actions.zoom_in'),
            icon: "/icons/coco/line/Zoom-In.svg",
            action: zoomIn,
            color: "gray",
        },
        {
            label: t('actions.zoom_out'),
            icon: "/icons/coco/line/Zoom-Out.svg",
            action: zoomOut,
            color: "gray",
        },
        {
            label: t('actions.reset'),
            icon: "/icons/coco/line/Rotate.svg",
            action: resetTransform,
            color: "gray",
        },
    ];

    return (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
            {buttons.map(({ label, icon, action, color }) => (
                <Button
                    key={label}
                    onPress={() => action && action()}
                    className={`p-2 bg-gray-500/40 font-medium backdrop-blur-md`}
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
