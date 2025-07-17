'use client';
import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import MaskedIcon from '../icons/Icon';

const OptionsMenu = ({ icon = '/icons/coco/line/More.svg', color = '#000', iconSize = 30, actions = [] }) => {
    return (
        <Dropdown>
            <DropdownTrigger>
                <button>
                    <MaskedIcon
                        src={icon}
                        color={color}
                        className={`flex-shrink-0 cursor-pointer w-9 h-9`}
                        alt="Options Menu"
                    />
                </button>
            </DropdownTrigger>

            <DropdownMenu variant="light" className="w-48">
                {actions.map(({ key, label, onClick }) => (
                    <DropdownItem key={key} onPress={() => onClick()}>
                        {label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
};

export default OptionsMenu;
