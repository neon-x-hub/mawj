'use client'

import React, { useState } from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'
import GenerateImageModal from '../../core/modal/GenerateImageModal'
import ExportProjectModal from '../../core/modal/ExportProjectModal'
import GenerateVideoModal from '../../core/modal/GenerateVideoModal'

export default function ProjectHead({ project }) {
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleGenerate = async (formData, onClose) => {
        setIsProcessing(true)
        setProgress(0)

        try {
            const requestBody = {
                options: {
                    format: formData.format ?? 'png',
                    regenerate_done: formData.regenerate_done ?? false,
                    parallelWorkers: formData.parallelWorkers ?? 1,
                    range: 'all',
                    keepThumbnails: formData.keepThumbnails ?? false,
                    useTrimming: formData.useTrimming ?? true,
                    videoBitrate: formData.videoBitrate ?? '5M',
                    codec: formData.codec ?? 'h264',
                    useGpu: formData.useGpu ?? false,
                    gpuBrand: formData.gpuBrand ?? 'nvidia',
                    audioBitrate: formData.audioBitrate ?? '192k'
                },
                project: project.id
            }

            const res = await fetch('/api/v1/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })

            if (!res.ok) throw new Error('Generation failed to start')

            const { jobId } = await res.json()

            while (progress < 100) {
                await new Promise(r => setTimeout(r, 1000))

                const statusRes = await fetch(`/api/v1/generate/status/${jobId}`)
                if (!statusRes.ok) throw new Error('Failed to get status')

                const status = await statusRes.json()
                const newProgress = status.progress || progress
                setProgress(Math.min(newProgress, 100))

                if (newProgress >= 100) break
            }

        } catch (error) {
            console.error('Generation error:', error)
        } finally {
            setIsProcessing(false)
            window.location.reload()
        }
    }

    const handleExport = async (formData, onClose) => {
        setIsProcessing(true)
        setProgress(0)

        try {
            const requestBody = {
                include: {
                    metadata: formData.metadata || true,
                    template: formData.template || true,
                    baseLayers: formData.baseLayers || true,
                    datarows: formData.datarows || false,
                    outputs: formData.outputs || false,
                    fonts: formData.fonts || true,
                },
                outputDir: formData.outputDir
            }

            console.log("Request body: ", requestBody);

            const res = await fetch(`/api/v1/projects/${project.id}/package/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })

            if (!res.ok) throw new Error('Generation failed to start')

            const { jobId } = await res.json()

            while (progress < 100) {
                await new Promise(r => setTimeout(r, 1000))

                const statusRes = await fetch(`/api/v1/projects/${project.id}/package/export/status/${jobId}`)
                if (!statusRes.ok) throw new Error('Failed to get status')

                const status = await statusRes.json()
                const newProgress = status.progress || progress
                setProgress(Math.min(newProgress, 100))

                if (newProgress >= 100) break
            }

            await new Promise(r => setTimeout(r, 1000)) // Wait for 1 second, just for the UI progress to animate

        } catch (error) {
            console.error('Generation error:', error)
        } finally {
            setIsProcessing(false)
        }
    }


    return (
        <SectionHead
            title={`${project.name}`}
            iconUrl={'/icons/coco/bold/Bag.svg'}
            options={{
                actions: [{
                    key: 'open_output_folder',
                    label: t('actions.open_output_folder'),
                    description: t('actions.open_output_folder_desc'),
                    icon: '/icons/coco/bold/Folder.svg',
                    do: async () => {
                        const res = await fetch(`/api/v1/projects/${project.id}/remote_actions/open_output_folder`);
                        const json = await res.json();

                        if (res.ok) {
                            console.log('✅ Folder opened:', json.message);
                        } else {
                            console.error('❌ Failed to open folder:', json.error);
                        }
                    }
                }],
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
                        content: (props) => (
                            /* Depends on the project type if it is video or card or other */
                            project.type === 'card' && <GenerateImageModal
                                project={project}
                                {...props}
                                isProcessing={isProcessing}
                                progress={progress}
                            />
                            ||
                            project.type === 'video' && <GenerateVideoModal
                                project={project}
                                {...props}
                                isProcessing={isProcessing}
                                progress={progress}
                            />

                        ),
                        actionLabel: t('actions.generate'),
                        hasCancelButton: false,
                        action: async (formData, onClose) => {
                            await handleGenerate(formData, onClose)
                        },
                        isProcessing,
                    }
                },
                {
                    key: 'export',
                    label: t('actions.export'),
                    endIconUrl: '/icons/coco/line/Export.svg',
                    isPrimary: false,
                    endIconSize: '20px',
                    modal: {
                        title: t('actions.export_project'),
                        content: (props) => (
                            <ExportProjectModal
                                project={project}
                                {...props}
                                isProcessing={isProcessing}
                                progress={progress}
                            />
                        ),
                        actionLabel: t('actions.export'),
                        hasCancelButton: false,
                        action: async (formData, onClose) => {
                            await handleExport(formData, onClose)
                        },
                        isProcessing,
                    }
                }
            ]}
        />
    )
}
