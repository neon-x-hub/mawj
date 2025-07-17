'use client'

import React from 'react'
// I18N
import { t } from '@/app/i18n'
// Components
import TemplateSectionHead from '../components/features/templates/TemplateSectionHead'
import ResponiveGrid from '../components/layout/ResponiveGrid'
import GenericCard from '../components/core/cards/GenericCard'
import DynamicBreadcrumbs from '../components/core/breadcrumbs/DynamicBreadCrumbs'


export default function Page() {
    return (
        <>
            <TemplateSectionHead />
            <DynamicBreadcrumbs basePath={'/templates'} baseLabel={t('common.templates')} />
            <ResponiveGrid>
                <GenericCard
                    title="المشروع الافتراضي"
                    description="وصف مختصر للمشروع و محتوايته"
                    previews={[
                        'https://picsum.photos/200/300',
                        'https://picsum.photos/200/300',
                    ]}
                    options={{
                        actions: [
                            {
                                key: 'copy',
                                label: 'Copy link',
                                description: 'Copy the file link',
                                icon: '/icons/coco/bold/Note-add.svg',
                            },
                        ],
                        danger: [
                            {
                                key: 'delete',
                                label: 'Delete project',
                                description: 'This action is irreversible',
                                icon: '/icons/coco/bold/Delete.svg',
                            },
                        ],
                    }}
                />
                <GenericCard
                    title="المشروع الافتراضي"
                    description="وصف مختصر للمشروع و محتوايته"
                    previews={[
                        'https://picsum.photos/200/300',
                        'https://picsum.photos/200/300',
                    ]}
                    options={{
                        actions: [
                            {
                                key: 'copy',
                                label: 'Copy link',
                                description: 'Copy the file link',
                                icon: '/icons/coco/bold/Note-add.svg',
                            },
                        ],
                        danger: [
                            {
                                key: 'delete',
                                label: 'Delete project',
                                description: 'This action is irreversible',
                                icon: '/icons/coco/bold/Delete.svg',
                            },
                        ],
                    }}
                />
                <GenericCard
                    title="المشروع الافتراضي"
                    description="وصف مختصر للمشروع و محتوايته"
                    previews={[
                        'https://picsum.photos/200/300',
                        'https://picsum.photos/200/300',
                    ]}
                    options={{
                        actions: [
                            {
                                key: 'copy',
                                label: 'Copy link',
                                description: 'Copy the file link',
                                icon: '/icons/coco/bold/Note-add.svg',
                            },
                        ],
                        danger: [
                            {
                                key: 'delete',
                                label: 'Delete project',
                                description: 'This action is irreversible',
                                icon: '/icons/coco/bold/Delete.svg',
                            },
                        ],
                    }}
                />
                <GenericCard
                    title="المشروع الافتراضي"
                    description="وصف مختصر للمشروع و محتوايته"
                    previews={[
                        'https://picsum.photos/200/300',
                        'https://picsum.photos/200/300',
                    ]}
                    options={{
                        actions: [
                            {
                                key: 'copy',
                                label: 'Copy link',
                                description: 'Copy the file link',
                                icon: '/icons/coco/bold/Note-add.svg',
                            },
                        ],
                        danger: [
                            {
                                key: 'delete',
                                label: 'Delete project',
                                description: 'This action is irreversible',
                                icon: '/icons/coco/bold/Delete.svg',
                            },
                        ],
                    }}
                />
                <GenericCard
                    title="المشروع الافتراضي"
                    description="وصف مختصر للمشروع و محتوايته"
                    previews={[
                        'https://picsum.photos/200/300',
                        'https://picsum.photos/200/300',
                    ]}
                    options={{
                        actions: [
                            {
                                key: 'copy',
                                label: 'Copy link',
                                description: 'Copy the file link',
                                icon: '/icons/coco/bold/Note-add.svg',
                            },
                        ],
                        danger: [
                            {
                                key: 'delete',
                                label: 'Delete project',
                                description: 'This action is irreversible',
                                icon: '/icons/coco/bold/Delete.svg',
                            },
                        ],
                    }}
                />
            </ResponiveGrid>

        </>
    )
}
