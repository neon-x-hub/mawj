'use client';

import React from 'react';
// Design Tokens
import { colors } from '@/app/styles/designTokens';
// Components
import SectionHeadTitle from './SectionHeadTitle';
import { Input, } from '@heroui/react';
import ActionButton from '../core/buttons/actionButton';
import OptionsMenu from '../core/buttons/OptionMenu';
import SortAndFilter from '../core/buttons/SortFilterButtonGroup';
import ActionsDropdown from '../core/menu/OptionMenu';
import ActionButtonWithOptionalModal from '../core/buttons/ActionButtonWithModal';


export function SectionHead({
    iconUrl,
    title,
    options = null,
    buttons = [],
    search = null,
    onSort = null,
    onFilter = null
}) {
    return (
        <div className="w-full flex items-center justify-between gap-4">

            {/* 📌 Right: Title + Icon */}
            <SectionHeadTitle iconUrl={iconUrl} title={title} />

            {/* 📌 Left: Options menu + Action Buttons + Search */}
            <div className="flex items-center gap-4">

                {search && (
                    <Input
                        width="200px"
                        placeholder={search.placeholder}
                        className="!min-w-[200px] r30"
                        onChange={(e) => search.onSearch(e.target.value)}
                    />
                )}

                {buttons.map((btn) => {
                    const { key, ...props } = btn;
                    return <ActionButtonWithOptionalModal key={key} {...props} />;
                })}


                {/* 📌 Sort and Filter Buttons */}
                {onSort && onFilter && (
                    <SortAndFilter onSort={onSort} onFilter={onFilter} />
                )}

                {/* 📌 Options Dropdown */}
                {options && (
                    <ActionsDropdown
                        actions={options.actions}
                        danger={options.danger}
                        icon="/icons/coco/line/More.svg"
                        color={colors.primary}
                        iconSize={30}
                        IconClassName="cursor-pointer w-9 h-9"
                    />
                )}

            </div>
        </div>
    );
}
