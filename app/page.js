'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ For navigation
import { t } from '@/app/i18n';

// Components
import HeroBanner from './components/features/home/banner';
import FolderSectionHead from './components/features/home/FolderSectionHead';
import GenericCard from './components/core/cards/GenericCard';
import ResponiveGrid from './components/layout/ResponiveGrid';
import ProjectDirectOptions from './components/core/menu/ProjectDirectOptions';

export default function Home() {
    const router = useRouter();

    // ✅ State to store projects, loading, and error
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Fetch projects on component mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/v1/folders'); // ✅ Relative API call
                if (!res.ok) throw new Error('Failed to fetch projects');
                const data = await res.json();
                setProjects(data.data || []); // ✅ Adjust based on your API response structure
                console.log("Projects fetched:", data.data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <>
            <HeroBanner />
            <FolderSectionHead />

            {/* ✅ Loading and Error States */}
            {loading && <p>{t('loading')}...</p>}
            {error && <p style={{ color: 'red' }}>{t('error')}: {error}</p>}

            {/* ✅ Projects Grid */}
            {!loading && !error && (
                <ResponiveGrid>
                    {projects.map((project) => (
                        <GenericCard
                            key={project.id}
                            title={project.title}
                            description={project.description}
                            previews={project.previews || []}
                            onPress={() => router.push(`/projects?f=${project.id}`)}
                            optionsContent={<ProjectDirectOptions project={project} />}
                        />
                    ))}
                </ResponiveGrid>
            )}
        </>
    );
}
