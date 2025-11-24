'use client'

import React, { useEffect, useState } from 'react'
import { t } from '@/app/i18n'
import { Select, SelectItem, Progress, Checkbox, NumberInput, Slider } from '@heroui/react'
import GenerateImageFAMPanel from './GenerateImageFAMPanel'

export default function GenerateImageModal({
    project,
    formData,
    handleInputChange,
    handleGenerate,
    isProcessing,
    progress
}) {

    const renderTimeMap = {
        jpg: 0.08,   // very fast
        png: 0.25,   // slower due to lossless compression
        webp: 0.22   // slightly faster than PNG, good compromise
    }


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
            <GenerateImageFAMPanel
                projectId={project.id}
                formData={formData}
                renderTimeMap={renderTimeMap}
            />


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
