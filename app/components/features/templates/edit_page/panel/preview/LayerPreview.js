import React from 'react'
import { t } from '@/app/i18n'
import MaskedIcon from '@/app/components/core/icons/Icon'

export default function LayerPreview({ layer, handlePropsChange }) {
    return (
        <div className="mb-3 p-2 border rounded bg-gray-50 bg-[url('/bg/grid/square-2.jpg')] bg-repeat bg-center bg-[length:450px_450px]">
            <div className="text-xs font-normal text-gray-500 mb-1 flex items-center gap-1">
                <MaskedIcon
                    src={'/icons/coco/line/Eye.svg'}
                    color="#6b7280"
                    height="15px"
                    width="15px"
                />
                {t('actions.preview')}
            </div>
            <div className="relative w-full h-24 flex items-center justify-center overflow-hidden ]">
                {layer.renderPreview(handlePropsChange)}
            </div>
        </div>
    )
}
