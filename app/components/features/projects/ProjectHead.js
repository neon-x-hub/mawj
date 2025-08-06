'use client'

import React, { useState } from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'
import {
    Select,
    SelectItem,
    Progress,
    Checkbox,
    NumberInput
} from '@heroui/react'

export default function ProjectHead({ project }) {
    const defaultOutputPath = `/projects/${project.id}/output/`
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleGenerate = async (formData, onClose) => {
        setIsProcessing(true)
        setProgress(0)

        try {
            // Start generation
            const requestBody = {
                options: {
                    format: formData.format ?? 'png',
                    regenerate_done: formData.regenerate_done ?? false,
                    parallelWorkers: formData.parallelWorkers ?? 1,
                    range: 'all'
                },
                project: project.id
            }

            console.log('requestBody', requestBody);


            const res = await fetch('/api/v1/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })

            if (!res.ok) throw new Error('Generation failed to start')

            const { jobId } = await res.json()

            // Poll for progress
            while (progress < 100) {
                await new Promise(resolve => setTimeout(resolve, 1000))

                const statusRes = await fetch(`/api/v1/generate/status/${jobId}`)
                if (!statusRes.ok) throw new Error('Failed to get status')

                const status = await statusRes.json()
                const newProgress = status.progress || progress
                setProgress(Math.min(newProgress, 100))

                if (newProgress >= 100) break
            }

        } catch (error) {
            console.error('Generation error:', error)
            // Optionally show error to user
        } finally {
            setIsProcessing(false)
            window.location.reload();
        }
    }

    return (
        <SectionHead
            title={`${project.name}`}
            iconUrl={'/icons/coco/bold/Bag.svg'}
            options={{
                actions: [],
                danger: [{
                    key: 'delete',
                    label: t('actions.generic.delete.label', { object: t('common.the_project') }),
                    description: t('actions.generic.delete.desc', { object: t('common.the_project') }),
                    icon: '/icons/coco/bold/Trash-2.svg',
                }],
            }}
            buttons={[
                {
                    key: 'Generate',
                    label: t('actions.generate'),
                    endIconUrl: '/icons/coco/line/Star.svg',
                    isPrimary: true,
                    endIconSize: '20px',
                    modal: {
                        title: t('actions.start_generation_process'),
                        content: ({ formData, handleInputChange }) => (
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

                                {/* Format Selection */}
                                <Select
                                    className="w-full"
                                    label={t('common.output_format')}
                                    placeholder="Select output format"
                                    selectedKeys={new Set([formData.format || 'png'])}
                                    onSelectionChange={(keys) => {
                                        const selectedFormat = Array.from(keys)[0] || 'png';
                                        handleInputChange({ target: { name: 'format', value: selectedFormat } });
                                    }}
                                    disabled={isProcessing}
                                    description={
                                        <details >
                                            <summary className='cursor-pointer'>{t('tips.quick_tip') + " : " + t('tips.image_format')}</summary>
                                            <span className='whitespace-pre-line'>{t('tips.image_format_tip_png_vs_jpg')}</span>
                                        </details>
                                    }
                                >
                                    <SelectItem key="png">PNG</SelectItem>
                                    <SelectItem key="jpg">JPG</SelectItem>
                                    <SelectItem key="webp">WebP</SelectItem>
                                    {project.type === 'video' && <SelectItem key="mp4">MP4</SelectItem>}
                                    {project.type === 'booklet' && <SelectItem key="pdf">PDF</SelectItem>}
                                </Select>

                                {/* Parallel Workers Input */}
                                <NumberInput
                                    className="w-full"
                                    label={t('common.parallel_workers')}
                                    placeholder="Enter number of workers"
                                    value={formData.parallelWorkers ?? 1} // default to 1
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
                                >
                                    {t('actions.regenerate_done')}
                                </Checkbox>
                            </div>
                        ),
                        actionLabel: t('actions.generate'),
                        closeLabel: t('actions.cancel'),
                        action: async (formData, onClose) => {
                            await handleGenerate(formData, onClose)
                        },
                        isProcessing, // Pass processing state to modal
                    }
                },
                {
                    key: 'export',
                    label: t('actions.export'),
                    endIconUrl: '/icons/coco/line/Export.svg',
                    isPrimary: false,
                    onClick: () => console.log('Export'),
                    endIconSize: '20px',
                }
            ]}
        />
    )
}
