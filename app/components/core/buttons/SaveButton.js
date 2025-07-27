'use client';

import { t } from "@/app/i18n";
import MaskedIcon from "@/app/components/core/icons/Icon";
import { Button } from "@heroui/react";

export default function SaveButton({ onPress }) {

    return (
        <Button
            color="primary"
            onPress={onPress}
            startContent={
                <MaskedIcon
                    src="/icons/hugeicons/line/floppy-disk.svg"
                    color="#ffffff"
                    height="22px"
                    width="22px"
                />
            }
            className="absolute bottom-6 left-6 z-50"
        >
            <span className="font-normal text-lg text-white">
                {t('actions.save')}
            </span>
        </Button>
    );
}
