'use client';

import React from 'react';
import { t } from '@/app/i18n';
import { Listbox, ListboxItem } from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">{children}</div>
);

export default function FolderDirectOptions({ folder }) {
    const handleFolderAction = (key) => {
        switch (key) {
            case 'open':
                console.log(`📂 Opening folder: ${folder?.name}`);
                // TODO: navigate to folder page
                break;
            case 'rename':
                console.log(`✏️ Renaming folder: ${folder?.name}`);
                // TODO: trigger rename modal or inline edit
                break;
            case 'delete':
                console.log(`🗑️ Deleting folder: ${folder?.name}`);
                // TODO: send DELETE request to API
                break;
            default:
                console.warn('Unknown folder action:', key);
        }
    };

    return (
        <div className="space-y-1 w-[150px] max-w-md">
            <ListboxWrapper>
                <Listbox aria-label="Folder Actions" onAction={handleFolderAction}>

                    {/* ✅ Open Folder */}
                    <ListboxItem
                        key="open"
                        startContent={
                            <MaskedIcon
                                src="/icons/coco/line/Folder-open.svg"
                                height="18px"
                                width="18px"
                                color="currentColor"
                            />
                        }
                        classNames={{
                            title: 'font-medium',
                        }}
                    >
                        {t('actions.open')}
                    </ListboxItem>

                    {/* ✅ Rename Folder */}
                    <ListboxItem
                        key="rename"
                        startContent={
                            <MaskedIcon
                                src="/icons/coco/line/Edit.svg"
                                height="18px"
                                width="18px"
                                color="currentColor"
                            />
                        }
                        classNames={{
                            title: 'font-medium',
                        }}
                    >
                        {t('actions.rename')}
                    </ListboxItem>

                    {/* ✅ Delete Folder */}
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
