'use client';

import React from 'react';
import { t } from '@/app/i18n';
import { Listbox, ListboxItem } from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">{children}</div>
);

export default function ProjectDirectOptions({ project }) {
    const handleProjectAction = (key) => {
        switch (key) {
            case 'open':
                console.log(`Opening project: ${project?.title}`);
                break;
            case 'duplicate':
                console.log(`Duplicating project: ${project?.title}`);
                break;
            case 'delete':
                console.log(`Deleting project: ${project?.title}`);
                break;
            default:
                console.warn('Unknown action:', key);
        }
    };

    return (
        <div className="space-y-1 w-[150px] max-w-md">
            <ListboxWrapper>
                <Listbox aria-label="Project Actions" onAction={handleProjectAction}>

                    {/* ✅ Duplicate Project */}
                    <ListboxItem
                        key="duplicate"
                        startContent={
                            <MaskedIcon
                                src="/icons/coco/line/Copy.svg"
                                height="18px"
                                width="18px"
                                color="currentColor"
                            />
                        }
                        classNames={{
                            title: 'font-medium',
                        }}
                    >
                        {t('actions.duplicate')}
                    </ListboxItem>

                    {/* ✅ Delete Project */}
                    <ListboxItem
                        key="delete"
                        color="danger"
                        startContent={
                            <MaskedIcon
                                src="/icons/coco/line/Trash-2.svg"
                                height="18px"
                                width="18px"
                                color="currentColor"
                                className="group-hover:text-white"
                            />
                        }
                        classNames={{
                            wrapper: 'group text-danger',
                            title: 'group-hover:text-white font-medium',
                        }}
                    >
                        {t('actions.delete')}
                    </ListboxItem>

                </Listbox>
            </ListboxWrapper>
        </div>
    );
}
