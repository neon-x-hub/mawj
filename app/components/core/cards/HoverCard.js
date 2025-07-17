'use client';

import React from 'react';
import { t, getLang } from '@/app/i18n';
import { Card, CardHeader, CardFooter } from '@heroui/react';
import { Button } from '@heroui/react';
import ActionsDropdown from '../menu/OptionMenu';
import MaskedIcon from '../icons/Icon';
export default function HoverCard({
    imageSrc,
    title,
    subtitle,
    footerTitle,
    onEditClick,
    OptionsDropdown,
}) {
    return (
        <Card
            isFooterBlurred
            className="group relative w-full h-full col-span-12 sm:col-span-7 overflow-hidden r30"
        >
            <img
                alt="Card background"
                className="z-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                src={imageSrc}
            />
            <img
                alt="Card background"
                className="absolute z-1 w-full h-full object-cover group-hover:scale-110 transition-transform duration-600 blur-lg opacity-0 group-hover:opacity-100"
                src={imageSrc}
            />

            <CardHeader className="absolute z-10 top-0 right-1 flex-col items-start mix-blend-exclusion">
                {title && (
                    <h4 className="text-white/90 font-medium mb-1 text-xl">{title}</h4>
                )}
                {subtitle && (
                    <p className="text-tiny text-white/60 uppercase font-normal">{subtitle}</p>
                )}
            </CardHeader>

            <CardFooter
                className="absolute bottom-0 z-10 w-full backdrop-blur-md bg-white/80
     transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-full rounded-b-[30px]"
            >
                <div className="flex items-center justify-between w-full">
                    <p className="text-gray-800 font-medium text-sm">{footerTitle}</p>

                    <div className="flex items-center gap-2 px-1">
                        <Button
                            size="sm"
                            radius="full"
                            className="text-gray-800 font-medium text-[13px] bg-black/10 hover:bg-black/20"
                            onPress={onEditClick}
                            startContent={
                                getLang() === 'ar' && (
                                    <MaskedIcon
                                        src={'/Icons/coco/line/Edit-3.svg'}
                                        color="#333"
                                        className="flex-shrink-0"
                                        height={17}
                                        width={17}
                                    />
                                )
                            }
                            endContent={
                                getLang() !== 'ar' && (
                                    <MaskedIcon
                                        src={'/Icons/coco/line/Edit-3.svg'}
                                        color="#333"
                                        className="flex-shrink-0"
                                        height={17}
                                        width={17}
                                    />
                                )
                            }
                        >
                            {t('actions.edit')}
                        </Button>
                        {OptionsDropdown && (
                            <ActionsDropdown
                                actions={OptionsDropdown.actions}
                                danger={OptionsDropdown.danger}
                                icon="/icons/feather/line/more-vertical.svg"
                                color="#333"
                                iconSize={20}
                                IconClassName="cursor-pointer"
                            />
                        )}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
