'use client';

import { useState } from 'react';
// Design Tokens
import { colors } from '@/app/styles/designTokens';
// Components
import MaskedIcon from '../icons/Icon';
import { Tooltip } from '@heroui/react';

const SORT_MODES = ['name', 'createdAt', 'updatedAt'];

export default function SortAndFilter({ onSort, onFilter }) {
    const [sortIndex, setSortIndex] = useState(0);

    const handleSortClick = () => {
        // Cycle to next sort mode
        const nextIndex = (sortIndex + 1) % SORT_MODES.length;
        setSortIndex(nextIndex);

        // Trigger callback with current sort mode
        if (onSort) onSort(SORT_MODES[nextIndex]);
    };

    const currentSortMode = SORT_MODES[sortIndex];

    return (
        <div className="flex items-center gap-2">
            {onSort && (
                <Tooltip content={`Sort by ${currentSortMode}`} placement="top">
                    <button
                        onClick={handleSortClick}
                    >
                        <MaskedIcon
                            src="/icons/coco/line/Sort.svg"
                            color={colors.primary}
                            className="flex-shrink-0 transition-transform duration-200"
                            height="30px"
                            width="30px"
                        />
                    </button>
                </Tooltip>
            )}

            {onFilter && (
                <button onClick={onFilter} title="Filter">
                    <MaskedIcon
                        src="/icons/coco/line/Filter.svg"
                        color={colors.primary}
                        className="flex-shrink-0"
                        height="28px"
                        width="28px"
                    />
                </button>
            )}
        </div>
    );
}
