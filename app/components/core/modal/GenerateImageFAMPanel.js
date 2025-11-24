'use client'

import React, { useState, useEffect } from 'react'
import { Button, Spinner } from '@heroui/react'
import { t } from '@/app/i18n'

export default function GenerateImageFAMPanel({
    projectId,
    formData,
    renderTimeMap,
    onUpdate
}) {

    const [metadata, setMetadata] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchMetadata = async (refresh = false) => {
        setLoading(true)
        try {
            const url =
                `/api/v1/projects/${projectId}/data/metadata` +
                (refresh ? '?refresh=true' : '')

            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to fetch metadata')

            const data = await res.json()
            setMetadata(data)

            onUpdate?.(data)
        } catch (err) {
            console.error('Metadata fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMetadata(false)
    }, [projectId])

    // ---- Estimated Time ----
    const selectedFormat = formData.format || 'png'
    const estimatedTimePerImage = renderTimeMap[selectedFormat] || 0.5

    const totalRows = metadata?.total || 0
    const doneRows = metadata?.done || 0

    const shouldRegenerateAll = formData.regenerate_done === true
    const remainingRows = shouldRegenerateAll
        ? totalRows
        : Math.max(totalRows - doneRows, 0)

    const estimatedTotalTime = (remainingRows * estimatedTimePerImage).toFixed(1)


    return (
        <div className="relative p-2 bg-gray-50 rounded border text-sm min-h-[90px]">

            {/* Refresh Button */}
            <Button
                size="sm"
                variant="light"
                className="absolute top-1 left-1"
                onPress={() => fetchMetadata(true)}
                isDisabled={loading}
            >
                {loading ? <Spinner size="sm" /> : t('actions.refresh')}
            </Button>

            <div className="mt-6">
                {loading ? (
                    <div className="animate-pulse space-y-1">
                        <p><strong>{t('common.total_rows')}:</strong> ...</p>
                        <p><strong>{t('common.completed_f')}:</strong> ...</p>
                        <p><strong>{t('common.remaining_f')}:</strong> ...</p>
                        <p><strong>{t('common.estimated_time')}:</strong> ...</p>
                    </div>
                ) : (
                    <>
                        <p><strong>{t('common.total_rows')}:</strong> {totalRows}</p>
                        <p><strong>{t('common.completed_f')}:</strong> {doneRows}</p>
                        <p><strong>{t('common.remaining_f')}:</strong> {remainingRows}</p>
                        <p className="mt-1 text-primary-600 font-medium">
                            ⏱ <strong>{t('common.estimated_time')}:</strong> ~{estimatedTotalTime}s
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
