'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { t } from '@/app/i18n';
import { Skeleton } from '@heroui/react';
import { useProjects } from '../../context/projects/projectsContext';
import ProjectSectionHead from './ProjectSectionHead';
import DynamicBreadcrumbs from '../../core/breadcrumbs/DynamicBreadCrumbs';
import ResponiveGrid from '../../layout/ResponiveGrid';
import GenericCard from '../../core/cards/GenericCard';
import ProjectDirectOptions from '../../core/menu/ProjectDirectOptions';

export default function ProjectsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const folderId = searchParams.get('f');

    const { projects, setProjects, loading, error, fetchProjects, updateProject } = useProjects();

    useEffect(() => {
        (async () => {
            try {
                if (folderId) {
                    const res = await fetch(`/api/v1/folders/${folderId}/projects`);
                    if (!res.ok) throw new Error('Failed to fetch folder projects');
                    const data = await res.json();
                    setProjects(data.data || []);
                } else {
                    await fetchProjects();
                }
            } catch (err) {
                console.error('Projects fetch error:', err);
            }
        })();
    }, [folderId]);

    return (
        <>
            <ProjectSectionHead />
            <DynamicBreadcrumbs basePath="/projects" baseLabel={t('common.projects')} />

            {error && <p style={{ color: 'red' }}>{t('error')}: {error}</p>}

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

            {!loading && !error && projects.length === 0 && (
                <p className="text-center font-bold text-2xl opacity-80 h-52 flex items-center justify-center text-gray-500">
                    {t('messages.error.no_projects_found')}
                </p>
            )}

            {!loading && !error && projects.length > 0 && (
                <ResponiveGrid>
                    {projects.map((project) => (
                        <GenericCard
                            key={project.id || `${Math.random() * 1000}`}
                            id={project.id}
                            title={{
                                value: project.name || project.title,
                                onEdit: (newTitle) => updateProject(project.id, { name: newTitle }),
                            }}
                            description={{
                                value: project.description,
                                onEdit: (newDesc) => updateProject(project.id, { description: newDesc }),
                            }}
                            previews={
                                project.previews ||
                                (project.template ? [`/api/v1/templates/${project.template}/preview`] : [])
                            }
                            onPress={() => router.push(`/projects/${project.id}`)}
                            optionsContent={<ProjectDirectOptions project={project} />}
                        />
                    ))}
                </ResponiveGrid>
            )}
        </>
    );
}
