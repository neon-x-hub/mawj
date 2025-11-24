'use client'

import React, { useState, useEffect } from 'react'
import { Button, Spinner } from '@heroui/react'
import { t } from '@/app/i18n'
import MaskedIcon from '../icons/Icon'

export default function GenerateVideoFAMPanel({ projectId, secondsPerMinute, onUpdate }) {
    const [metadata, setMetadata] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchMetadata = async (refresh = false) => {
        setLoading(true)
        try {
            const url = `/api/v1/projects/${projectId}/data/metadata` +
                (refresh ? '?refresh=true' : '')

            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to fetch metadata')

            const data = await res.json()
            setMetadata(data)

            // Inform parent if needed
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

    return (
        <div className="relative p-2 bg-gray-50 rounded border text-sm min-h-[100px]">

            {/* Refresh Button */}
            <Button
                size="sm"
                className="absolute top-1 left-1 h-7"
                onPress={() => fetchMetadata(true)}
                isDisabled={loading}
                color='default'
                radius='full'
                endContent={<MaskedIcon src="/icons/coco/line/rotate.svg" color="black" height="10px" width="10px" />}
            >
                {loading ? <Spinner size="sm" /> : t('actions.refresh')}
            </Button>

            {/* Content */}
            <div className="">
                {loading ? (
                    <div className="animate-pulse space-y-1">
                        <p><strong>{t('common.total_videos')}:</strong> ...</p>
                        <p><strong>{t('common.completed_f')}:</strong> ...</p>
                        <p><strong>{t('common.remaining_f')}:</strong> ...</p>
                        <p className="text-primary-600 font-medium">
                            ⏱ <strong>{t('common.estimated_speed')}:</strong> ...
                        </p>
                    </div>
                ) : (
                    <>
                        <p><strong>{t('common.total_videos')}:</strong> {metadata.total}</p>
                        <p><strong>{t('common.completed_f')}:</strong> {metadata.done}</p>
                        <p><strong>{t('common.remaining_f')}:</strong> {metadata.total - metadata.done}</p>

                        <p className="mt-1">
                            ⚡ <strong>{t('common.estimated_speed')}:</strong> {secondsPerMinute} ثانية لكل دقيقة فيديو
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
