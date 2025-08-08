'use client'

import React from 'react'
import { t } from '@/app/i18n'
import { Progress, Checkbox, Input } from '@heroui/react'
import { direction } from 'direction'

export default function ExportProjectModal({
    formData,
    handleInputChange,
    handleExport,
    isProcessing,
    progress
}) {
    const includeOptions = [
        { key: 'template', label: t('common.template'), desc: t('common.template_desc') },
        { key: 'baseLayers', label: t('common.base_layers'), desc: t('common.base_layers_desc') },
        { key: 'datarows', label: t('common.data'), desc: t('common.datarows_desc') },
        { key: 'outputs', label: t('common.outputs'), desc: t('common.outputs_desc') },
        { key: 'fonts', label: t('common.fonts'), desc: t('common.fonts_desc') }
    ]


    return (
        <div className="space-y-4">
            {/* Progress bar */}
            {isProcessing && (
                <div>
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

            {/* Include Options */}
            <div className="">
                <p className="font-medium">{t('common.include_items')}</p>
                <div className='flex flex-col space-y-3 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-300'>
                    {includeOptions.map(opt => (
                        <div key={opt.key} className="flex flex-col space-y-1">
                            <Checkbox
                                isSelected={formData.include?.[opt.key] || (['datarows', 'outputs'].includes(opt.key) ? false : true)}
                                onValueChange={(checked) =>
                                    handleInputChange({
                                        target: {
                                            name: `${opt.key}`,
                                            value: checked
                                        }
                                    })
                                }
                                isDisabled={isProcessing}
                                classNames={{
                                    icon: "after:bg-primary after:text-background text-background"
                                }}
                            >
                                {opt.label}
                            </Checkbox>
                            <span className="text-xs text-gray-500 pl-6">{opt.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Output Directory Picker */}
            <div className="">
                <p className="font-medium">{t('common.output_directory')}:</p>
                <Input
                    type="text"
                    placeholder={t('common.output_directory_placeholder')}
                    value={formData.outputDir}
                    onChange={(e) => handleInputChange({ target: { name: 'outputDir', value: e.target.value } })}
                    isDisabled={isProcessing}
                    description={t('common.output_directory_desc')}
                    style={{
                        direction: direction(formData?.outputDir) === 'ltr' ? 'ltr' : 'rtl'
                    }}
                />
            </div>
        </div>
    )
}
