'use client';

// Design Tokens
import { colors } from '@/app/styles/designTokens'
// Components
import MaskedIcon from '../icons/Icon'


export default function SortAndFilter({ onSort, onFilter }) {
    return (
        <div className="flex items-center gap-2">
            <button onClick={onSort}>
                <MaskedIcon
                    src="/icons/coco/line/Sort.svg"
                    color={colors.primary}
                    className="flex-shrink-0"
                    height='35px'
                    width='35px'
                />
            </button>
            <button onClick={onFilter}>
                <MaskedIcon
                    src="/icons/coco/line/Filter.svg"
                    color={colors.primary}
                    className="flex-shrink-0"
                    height='28px'
                    width='28px'
                />
            </button>
        </div>
    )
}
