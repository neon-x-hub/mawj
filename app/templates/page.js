'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// I18N
import { t } from '@/app/i18n';
// UI
import { Skeleton } from '@heroui/react';
// Context
import { useTemplates } from '../components/context/templates/templatesContext';
// Components
import TemplateSectionHead from '../components/features/templates/TemplateSectionHead';
import DynamicBreadcrumbs from '../components/core/breadcrumbs/DynamicBreadCrumbs';
import ResponiveGrid from '../components/layout/ResponiveGrid';
import GenericCard from '../components/core/cards/GenericCard';
import TemplateDirectOptions from '../components/core/menu/TemplateDirectOptions';

export default function TemplatesPage() {
    const router = useRouter();

    // ✅ Context
    const { templates, setTemplates, loading, error, fetchTemplates, updateTemplate } = useTemplates();

    // ✅ Fetch templates on mount
    useEffect(() => {
        (async () => {
            try {
                await fetchTemplates();
            } catch (err) {
                console.error('Templates fetch error:', err);
            }
        })();
    }, []);

    return (
        <>
            <TemplateSectionHead />
            <DynamicBreadcrumbs basePath="/templates" baseLabel={t('common.templates')} />

            {/* ✅ Error Handling */}
            {error && <p style={{ color: 'red' }}>{t('error')}: {error}</p>}

            {/* ✅ Loading Skeleton */}
            {loading && (
                <ResponiveGrid>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg shadow-sm space-y-3">
                            <Skeleton className="flex rounded-full w-12 h-12" />
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-3 w-full rounded-md" />
                            <Skeleton className="h-3 w-2/3 rounded-md" />
                        </div>
                    ))}
                </ResponiveGrid>
            )}

            {/* ✅ Empty State */}
            {!loading && !error && templates.length === 0 && (
                <p className="text-center font-bold text-2xl opacity-80 h-52 flex items-center justify-center text-gray-500">
                    {t('messages.error.no_templates_found')}
                </p>
            )}

            {/* ✅ Templates Grid */}
            {!loading && !error && templates.length > 0 && (
                <ResponiveGrid>
                    {templates.map((template) => (
                        <GenericCard
                            key={template.id}
                            id={template.id}
                            title={{
                                value: template.name || template.title,
                                onEdit: (newTitle) => updateTemplate(template.id, { name: newTitle }),
                            }}
                            description={{
                                value: template.description,
                                onEdit: (newDesc) => updateTemplate(template.id, { description: newDesc }),
                            }}
                            previews={template.previews || []}
                            onPress={() => router.push(`/templates/${template.id}`)}
                            optionsContent={<TemplateDirectOptions template={template} />}
                        />
                    ))}
                </ResponiveGrid>
            )}
        </>
    );
}
