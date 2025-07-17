import React from 'react'
import MaskedIcon from '@/app/components/core/icons/Icon'

export default function PanelSectionTitle({ title, className, iconSrc, iconOptions }) {
    return (
        <h2 className={`text-base font-medium flex items-center gap-2 ${className}`}>
            {iconSrc && (
                <MaskedIcon
                    src={iconSrc}
                    color="black"
                    height="20px"
                    width="20px"
                    {...iconOptions}
                />
            )}
            {title}
        </h2>
    )
}
