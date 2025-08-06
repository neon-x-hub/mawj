'use client'

import React, { useEffect, useState } from 'react'
import { t } from '@/app/i18n'
import { Select, SelectItem, Progress, Checkbox, NumberInput, Slider } from '@heroui/react'

export default function GenerateImageModal({
    project,
    formData,
    handleInputChange,
    handleGenerate,
    isProcessing,
    progress
}) {
    const [metadata, setMetadata] = useState(null)
    const [loadingMetadata, setLoadingMetadata] = useState(true)

    const renderTimeMap = {
        jpg: 0.08,   // very fast
        png: 0.25,   // slower due to lossless compression
        webp: 0.22   // slightly faster than PNG, good compromise
    }

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await fetch(`/api/v1/projects/${project.id}/data/metadata`)
                if (!res.ok) throw new Error('Failed to fetch metadata')
                const data = await res.json()
                setMetadata(data)
            } catch (err) {
                console.error('Metadata fetch error:', err)
            } finally {
                setLoadingMetadata(false)
            }
        }
        fetchMetadata()
    }, [project.id])

    // ✅ Calculate estimated time
    const selectedFormat = formData.format || 'png'
    const estimatedTimePerImage = renderTimeMap[selectedFormat] || 0.5
    const totalRows = metadata?.total || 0
    const doneRows = metadata?.done || 0
    const shouldRegenerateAll = formData.regenerate_done === true
    const remainingRows = shouldRegenerateAll ? totalRows : Math.max(totalRows - doneRows, 0)
    const estimatedTotalTime = (remainingRows * estimatedTimePerImage).toFixed(1)


    return (
        <div className="space-y-4">
            {/* Progress bar - shown only during processing */}
            {isProcessing && (
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                            {t('common.progress')}: {Math.round(progress)}%
                        </span>
                    </div>
                    <Progress
                        value={progress}
                        minValue={0}
                        maxValue={100}
                        color="primary"
                        className="w-full"
                    />
                </div>
            )}

            {/* Metadata & Estimated Time */}
            <div className="p-2 bg-gray-50 rounded border text-sm min-h-[80px]">
                {loadingMetadata ? (
                    <div className="animate-pulse space-y-1">
                        <p><strong>{t('common.total_rows')}:</strong> ...</p>
                        <p><strong>{t('common.completed_f')}:</strong> ...</p>
                        <p><strong>{t('common.remaining_f')}:</strong> ...</p>
                        <p className="mt-1 text-primary-600 font-medium">
                            ⏱ <strong>{t('common.estimated_time')}:</strong> ...
                        </p>
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


            {/* Format Selection */}
            <Select
                className="w-full"
                label={t('common.output_format')}
                placeholder="Select output format"
                selectedKeys={new Set([formData.format || 'png'])}
                onSelectionChange={(keys) => {
                    const selectedFormat = Array.from(keys)[0] || 'png'
                    handleInputChange({ target: { name: 'format', value: selectedFormat } })
                }}
                disabled={isProcessing}
                description={
                    <details>
                        <summary className="cursor-pointer">
                            {t('tips.quick_tip') + ' : ' + t('tips.image_format')}
                        </summary>
                        <span className="whitespace-pre-line">
                            {t('tips.image_format_tip_png_vs_jpg')}
                        </span>
                    </details>
                }
            >
                <SelectItem key="png">PNG</SelectItem>
                <SelectItem key="jpg">JPG</SelectItem>
                <SelectItem key="webp">WebP</SelectItem>
            </Select>

            {/* Quality Slider (only for JPG) */}
            {formData.format === 'jpg' && (
                <>
                <label className="block text-sm">{t('common.quality')}</label>
                <Slider
                    aria-label="Image Quality"
                    className="max-w-md mt-2"
                    style={{ direction: 'ltr' }}
                    size='lg'
                    minValue={10}
                    maxValue={100}
                    step={10}
                    value={formData.quality ?? 80}
                    color={
                        (formData.quality ?? 80) <= 30
                            ? 'danger'
                            : (formData.quality ?? 80) <= 60
                                ? 'warning'
                                : 'primary'
                    }
                    onChange={(val) => handleInputChange({ target: { name: 'quality', value: val } })}
                    isDisabled={isProcessing}
                    showTooltip
                />
                </>
            )}

            {/* Parallel Workers Input */}
            <NumberInput
                className="w-full"
                label={t('common.parallel_workers')}
                placeholder="Enter number of workers"
                value={formData.parallelWorkers ?? 1}
                onValueChange={(val) =>
                    handleInputChange({ target: { name: 'parallelWorkers', value: Number(val) } })
                }
                min={1}
                description={t('common.parallel_workers_desc')}
                isDisabled={isProcessing}
            />

            {/* Regenerate Done Checkbox */}
            <Checkbox
                isSelected={formData.regenerate_done || false}
                onValueChange={(isChecked) =>
                    handleInputChange({ target: { name: 'regenerate_done', value: isChecked } })
                }
                isDisabled={isProcessing}
                classNames={{
                    icon: "after:bg-primary after:text-background text-background"
                }}
            >
                {t('actions.regenerate_done')}
            </Checkbox>
        </div>
    )
}
