'use client'

import React from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'
import { useProjects } from '@/app/components/context/projects/projectsContext';


export default function ProjectHead({ project }) {
    const defaultOutputPath = `/projects/${project.id}/output/`
    return (
        <SectionHead
            title={`${project.name}`}
            iconUrl={'/icons/coco/bold/Bag.svg'}
            options={{
                actions: [
                    {
                        key: 'new',
                        label: 'Add New Project',
                        description: 'Create a new project',
                        icon: '/icons/coco/bold/Note-add.svg',
                    },
                ],
                danger: [],
            }}
            buttons={[
                {
                    key: 'Generate',
                    label: t('actions.generate'),
                    endIconUrl: '/icons/coco/line/Star.svg',
                    isPrimary: true,
                    endIconSize: '20px',
                    modal: {
                        title: 'بدء عملية التوليد',
                        content: (
                            <div className="space-y-4">
                                {/* Summary Section */}
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <p>📦 <strong>عدد العناصر:</strong> {'256'}</p>
                                    <p>⏱️ <strong>الوقت المقدر:</strong> ~{'5'} دقيقة</p>
                                    <p className="text-sm text-red-500">{'⚠️ بعض البيانات غير مكتملة!'}</p>
                                </div>

                                {/* Essential Settings */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">صيغة الإخراج</label>
                                    <select className="w-full border rounded p-2">
                                        <option>PNG</option>
                                        <option>JPG</option>
                                        <option>WEBP</option>
                                        {project.type === 'video' && <option>MP4</option>}
                                        {project.type === 'booklet' && <option>PDF</option>}
                                    </select>

                                    <label className="block text-sm font-medium">مجلد الإخراج</label>
                                    <input type="text" defaultValue={defaultOutputPath} className="w-full border rounded p-2" />
                                </div>

                                {/* Advanced Options */}
                                <details className="mt-3">
                                    <summary className="cursor-pointer font-medium">⚙️ خيارات متقدمة</summary>
                                    <div className="mt-2 space-y-2">
                                        <label className="block text-sm">نمط اسم الملف</label>
                                        <input type="text" placeholder="{{card_id}}_{{name}}" className="w-full border rounded p-2" />

                                        {project.type === 'video' && (
                                            <label className="flex items-center space-x-2">
                                                <input type="checkbox" /> <span>تسريع باستخدام GPU</span>
                                            </label>
                                        )}

                                        {project.type === 'booklet' && (
                                            <label className="block text-sm">نطاق الصفحات</label>
                                        )}
                                        {project.type === 'booklet' && (
                                            <input type="text" placeholder="مثال: 1-5" className="w-full border rounded p-2" />
                                        )}
                                    </div>
                                </details>
                            </div>
                        ),
                        actionLabel: 'بدء التوليد',
                        closeLabel: 'إلغاء',
                        action: () => console.log("Generate clicked"),
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
