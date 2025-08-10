'use client'

import React, { useState, useEffect } from 'react'
import { t } from '@/app/i18n'
import { Tabs, Tab, Button, Input, Checkbox, Spinner, Progress } from '@heroui/react'
import MaskedIcon from '../icons/Icon'

export default function ImportProjectModal() {
    const [activeTab, setActiveTab] = useState('inspection')
    const [file, setFile] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [inspectionResult, setInspectionResult] = useState(null)
    const [extractionOptions, setExtractionOptions] = useState({
        includeDatarows: true,
        includeOutputs: true,
        outputFontsDir: ''
    })
    const [progress, setProgress] = useState(0)
    const [jobId, setJobId] = useState(null)

    const formatSize = (bytes) => {
        if (bytes === 0) return `0 ${t('common.bytes')}`
        const k = 1024
        const sizes = [t('common.bytes'), 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
        setInspectionResult(null)
    }

    const handleInspect = async () => {
        if (!file) return

        setIsProcessing(true)
        setProgress(0)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/v1/projects/package/import/inspect', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            setInspectionResult(data)
            //if (data.success) setActiveTab('extraction')
        } catch (error) {
            console.error('Inspection error:', error)
            setInspectionResult({
                success: false,
                message: t('errors.inspection_failed')
            })
        } finally {
            setIsProcessing(false)
            setProgress(100)
        }
    }

    const handleExtract = async () => {
        if (!inspectionResult?.success) return

        setIsProcessing(true)
        setProgress(0)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('options', JSON.stringify(extractionOptions))

        try {
            const res = await fetch('/api/v1/projects/package/import', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.success && data.jobId) {
                setJobId(data.jobId)
                await pollExtractionProgress(data.jobId)
            } else {
                console.error('Extraction failed to start:', data.message)
            }
        } catch (error) {
            console.error('Extraction error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const pollExtractionProgress = async (jobId) => {
        while (progress < 100) {
            await new Promise(r => setTimeout(r, 600))

            try {
                const statusRes = await fetch(`/api/v1/projects/package/import/status/${jobId}`)
                if (!statusRes.ok) throw new Error('Failed to get status')

                const status = await statusRes.json()
                const newProgress = status.progress || progress
                setProgress(Math.min(newProgress, 100))

                if (newProgress >= 100) break
            } catch (error) {
                console.error('Progress polling error:', error)
                break
            }
        }
    }

    const handleOptionChange = (name, value) => {
        setExtractionOptions(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="space-y-4">
            {/* Progress bar - shown only during processing */}
            {isProcessing && (
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                            {activeTab === 'inspection'
                                ? t('actions.inspecting')
                                : t('actions.extracting')}: {Math.round(progress)}%
                        </span>
                    </div>
                    <Progress
                        value={progress}
                        minValue={0}
                        maxValue={100}
                        color="primary"
                        className="w-full"
                        aria-label={activeTab === 'inspection'
                            ? t('actions.inspecting_progress')
                            : t('actions.extracting_progress')}
                    />
                </div>
            )}

            <Tabs
                aria-label="Import project steps"
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
                disabledKeys={isProcessing ? ['inspection', 'extraction'] :
                    (inspectionResult?.success ? [] : ['extraction'])}
                color='primary'
                classNames={{
                    tabList: 'bg-gray-300',
                    tabContent: 'text-black group-data-[selected=true]:text-white font-medium',
                }}
            >
                {/* Inspection Tab */}
                <Tab
                    key="inspection"
                    title={
                        <div className="flex items-center gap-1">
                            {isProcessing && activeTab === 'inspection' && <Spinner size="sm" />}
                            <MaskedIcon
                                src={'/icons/coco/line/Scan.svg'}
                                color="currentColor"
                                height="18px"
                                width="18px"
                            />
                            {t('actions.inspection')}
                        </div>
                    }
                    className='flex flex-col items-center justify-center'
                >
                    <p className=" text-base whitespace-pre-line mb-4">
                        {t('tips.inspect_zip')}
                    </p>
                    <Input
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                        description={t('common.zip_file_desc')}
                        className='mb-4'
                    />

                    {inspectionResult && (
                        <div className={`w-full mb-4 p-3 rounded-xl border ${inspectionResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            {inspectionResult.success ? (
                                <>
                                    <p className="font-semibold text-green-800">{t('common.inspection_success')}</p>
                                    <div className="mt-2 space-y-1 text-sm">
                                        <p><strong>{t('common.total_size')}:</strong> {formatSize(inspectionResult.totalUncompressed)}</p>
                                        <p><strong>{t('common.datarows_size')}:</strong> {formatSize(inspectionResult.datarowsSize)}</p>
                                        <p><strong>{t('common.outputs_size')}:</strong> {formatSize(inspectionResult.outputsSize)}</p>
                                    </div>

                                    {inspectionResult.suspicious?.length > 0 && (
                                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="font-medium text-yellow-800">{t('common.suspicious_items')}:</p>
                                            <ul className="list-disc pl-5 mt-1 text-yellow-700">
                                                {inspectionResult.suspicious.map((item, idx) => (
                                                    <li key={idx}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-red-800">{inspectionResult.message || t('errors.inspection_failed')}</p>
                            )}
                        </div>
                    )}

                    <div className='flex justify-end w-full'>
                        <Button
                            onPress={handleInspect}
                            isLoading={isProcessing && activeTab === 'inspection'}
                            disabled={!file || (isProcessing && activeTab === 'inspection')}
                            color="primary"
                            className=' text-white font-medium'
                        >
                            {t('actions.inspection')} !
                        </Button>
                    </div>
                </Tab>

                {/* Extraction Tab */}
                <Tab
                    key="extraction"
                    title={
                        <div className="flex items-center gap-1">
                            {isProcessing && activeTab === 'extraction' && <Spinner size="sm" />}
                            <MaskedIcon
                                src={'/icons/coco/line/Unlock.svg'}
                                color="currentColor"
                                height="18px"
                                width="18px"
                            />
                            {t('actions.extraction')}
                        </div>
                    }
                    disabled={!inspectionResult?.success}
                >
                    <div className="flex flex-col space-y-3 mb-4">
                        <Checkbox
                            isSelected={extractionOptions.includeDatarows}
                            onValueChange={(val) => handleOptionChange('includeDatarows', val)}
                            classNames={{
                                icon: "after:bg-primary after:text-background text-background"
                            }}
                        >
                            {t('common.include_datarows')}
                            <p className="text-xs text-gray-500">{t('common.include_datarows_desc')}</p>
                        </Checkbox>

                        <Checkbox
                            isSelected={extractionOptions.includeOutputs}
                            onValueChange={(val) => handleOptionChange('includeOutputs', val)}
                            classNames={{
                                icon: "after:bg-primary after:text-background text-background"
                            }}
                        >
                            {t('common.include_outputs')}
                            <p className="text-xs text-gray-500">{t('common.include_outputs_desc')}</p>
                        </Checkbox>
                    </div>

                    <Input
                        label={t('common.font_folder')}
                        value={extractionOptions.outputFontsDir}
                        onChange={(e) => handleOptionChange('outputFontsDir', e.target.value)}
                        placeholder={t('common.font_folder_placeholder')}
                        description={t('common.font_folder_desc')}
                        disabled={isProcessing}
                    />

                    <div className='flex justify-end w-full'>
                        <Button
                            onClick={handleExtract}
                            isLoading={isProcessing && activeTab === 'extraction'}
                            color="primary"
                            className=' text-white font-medium'
                            disabled={!inspectionResult?.success || (isProcessing && activeTab === 'extraction')}
                        >
                            {t('actions.import')}
                        </Button>
                    </div>
                </Tab>
            </Tabs>
        </div>
    )
}
