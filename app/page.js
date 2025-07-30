'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/app/i18n';

// Components
import HeroBanner from './components/features/home/banner';
import FolderSectionHead from './components/features/home/FolderSectionHead';
import GenericCard from './components/core/cards/GenericCard';
import ResponiveGrid from './components/layout/ResponiveGrid';
import ProjectDirectOptions from './components/core/menu/ProjectDirectOptions';

export default function Home() {
    const router = useRouter();

    // ✅ State to store folders, loading, and error
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Fetch folders on component mount
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const res = await fetch('/api/v1/folders');
                if (!res.ok) throw new Error('Failed to fetch folders');
                const data = await res.json();
                setFolders(data.data || []);
                console.log("✅ Folders fetched successfully:", data.data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFolders();
    }, []);

    return (
        <>
            <HeroBanner />
            <FolderSectionHead />

            {/* ✅ Loading and Error States */}
            {loading && <p>{t('loading')}...</p>}
            {error && <p style={{ color: 'red' }}>{t('error')}: {error}</p>}

            {/* ✅ No Folders Case */}
            {!loading && !error && folders.length === 0 && (
                <p className='text-center font-bold text-2xl opacity-80 h-52 flex items-center justify-center text-gray-500'>
                    {t('messages.error.no_folders_found')}
                </p>
            )}

            {/* ✅ Render Grid if folders exist */}
            {!loading && !error && folders.length > 0 && (
                <ResponiveGrid>
                    {folders.map((folder) => (
                        <GenericCard
                            key={folder.id}
                            title={folder.name}
                            description={folder.description}
                            previews={folder.previews || []}
                            onPress={() => router.push(`/projects?f=${folder.id}`)}
                            optionsContent={<ProjectDirectOptions project={folder} />}
                        />
                    ))}
                </ResponiveGrid>
            )}
        </>
    );
}
