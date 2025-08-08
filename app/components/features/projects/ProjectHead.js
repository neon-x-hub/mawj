'use client'

import React, { useState } from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'
import GenerateImageModal from '../../core/modal/GenerateImageModal'
import ExportProjectModal from '../../core/modal/ExportProjectModal'

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
                    range: 'all'
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
                            project.type === 'card' && <GenerateImageModal
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
                            />
                        ),
                        actionLabel: t('actions.export'),
                        hasCancelButton: false,
                        action: () => { },
                    }
                }
            ]}
        />
    )
}
