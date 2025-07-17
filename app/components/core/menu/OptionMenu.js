'use client';
import React from 'react';
// I18N
import { t } from '@/app/i18n';
// Design Tokens
import { colors } from '@/app/styles/designTokens';
// Components
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem } from '@heroui/react';
import MaskedIcon from '../icons/Icon';

const iconClasses = 'text-xl text-default-500 pointer-events-none flex-shrink-0 w-6 h-6';

export default function ActionsDropdown({
    triggerLabel = 'Open Menu',
    actions = [],
    danger = [],
    icon = '/icons/coco/line/More.svg',
    color = '#000',
    iconSize = 30,
    IconClassName = '',
}) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <button>
                    {icon ? <MaskedIcon
                        src={icon}
                        color={color}
                        className={`flex-shrink-0 cursor-pointer ${IconClassName}`}
                        alt="Options Menu"
                        height={iconSize || '30px'}
                        width= {iconSize || '30px'}
                    /> : triggerLabel}
                </button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Dynamic actions dropdown" variant="faded">
                {/* Actions Section */}
                {actions.length > 0 && (
                    <DropdownSection showDivider={danger.length > 0} title={t('actions.types.actions')}>
                        {actions.map(({ key, label, description, shortcut, icon: Icon }) => (
                            <DropdownItem
                                key={key}
                                className='hover:!bg-blue-50 !border-0'
                                description={description}
                                shortcut={shortcut}
                                startContent={Icon ? <MaskedIcon src={Icon} className={iconClasses} color={colors.primary} /> : null}
                            >
                                <span className='font-medium'>
                                    {label}
                                </span>
                            </DropdownItem>
                        ))}
                    </DropdownSection>
                )}

                {/* Danger Section */}
                {danger.length > 0 && (
                    <DropdownSection title={t('actions.types.danger_zone')} >
                        {danger.map(({ key, label, description, shortcut, icon: Icon }) => (
                            <DropdownItem
                                key={key}
                                className="hover:!bg-red-50 !border-0"
                                color="danger"
                                description={description}
                                shortcut={shortcut}
                                startContent={Icon ? <MaskedIcon src={Icon} className={iconClasses} color={colors.danger} /> : null}
                            >
                                <span className='font-medium text-red-600'>
                                    {label}
                                </span>
                            </DropdownItem>
                        ))}
                    </DropdownSection>
                )}
            </DropdownMenu>
        </Dropdown>
    );
}
