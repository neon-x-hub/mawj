'use client';

import React from 'react';
import { t } from '@/app/i18n';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import MaskedIcon from '../icons/Icon';

const AddButtonWithPopover = ({ onAction, PopoverOptions }) => (
    <Popover placement="left-end" offset={20}>
        <PopoverTrigger>
            <Button
                variant="solid"
                color="default"
                className="mt-auto font-semibold bg-gray-400/50 backdrop-blur-lg !absolute !bottom-3 !left-3"
                endContent={
                    <MaskedIcon
                        src="/icons/coco/line/Plus.svg"
                        color="black"
                        height="25px"
                        width="25px"
                    />
                }
                onClick={onAction}
            >
                {t('actions.add')}
            </Button>
        </PopoverTrigger>
        <PopoverContent>
            {PopoverOptions}
        </PopoverContent>
    </Popover>
);

export default AddButtonWithPopover;
