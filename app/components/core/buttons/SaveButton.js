'use client';

import { t } from "@/app/i18n";
import MaskedIcon from "@/app/components/core/icons/Icon";
import { Button } from "@heroui/react";
import { useState } from "react";

export default function SaveButton({ onPress }) {
    const [isSaving, setIsSaving] = useState(false);

    const handlePress = async () => {
        if (isSaving) return; // prevent duplicate clicks
        try {
            setIsSaving(true);
            await onPress(); // expects onPress to return a Promise
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Button
            color="primary"
            onPress={() => handlePress()}
            isLoading={isSaving}
            startContent={
                !isSaving && (
                    <MaskedIcon
                        src="/icons/hugeicons/line/floppy-disk.svg"
                        color="#ffffff"
                        height="22px"
                        width="22px"
                    />
                )
            }
            className="absolute bottom-6 left-6 z-50"
        >
            <span className="font-normal text-lg text-white">
                {isSaving ? t('messages.saving') : t('actions.save')}
            </span>
        </Button>
    );
}
