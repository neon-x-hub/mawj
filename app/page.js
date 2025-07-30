'use client';

import { useRouter } from 'next/navigation';
import { t } from '@/app/i18n';
import { Skeleton } from '@heroui/react';

import { useFolders } from './components/context/folders/foldersContext';

// Components
import HeroBanner from './components/features/home/banner';
import FolderSectionHead from './components/features/home/FolderSectionHead';
import GenericCard from './components/core/cards/GenericCard';
import ResponiveGrid from './components/layout/ResponiveGrid';
import FolderDirectOptions from './components/core/menu/FolderDirectOptions';

export default function Home() {
    const router = useRouter();

    // ✅ Pull state & actions from context
    const { folders, loading, error, updateFolder } = useFolders();

    return (
        <>
            <HeroBanner />
            <FolderSectionHead />

            {/* ✅ Error State */}
            {error && <p style={{ color: 'red' }}>{t('error')}: {error}</p>}

            {/* ✅ Skeleton Loading State */}
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

            {/* ✅ No Folders Case */}
            {!loading && !error && folders.length === 0 && (
                <p className="text-center font-bold text-2xl opacity-80 h-52 flex items-center justify-center text-gray-500">
                    {t('messages.error.no_folders_found')}
                </p>
            )}

            {/* ✅ Render Grid if folders exist */}
            {!loading && !error && folders.length > 0 && (
                <ResponiveGrid>
                    {folders.map((folder) => (
                        <GenericCard
                            key={folder.id}
                            id={folder.id}
                            title={{
                                value: folder.name,
                                onEdit: (newName) => updateFolder(folder.id, { name: newName }),
                            }}
                            description={{
                                value: folder.description,
                                onEdit: (newDesc) => updateFolder(folder.id, { description: newDesc }),
                            }}
                            previews={folder.previews || []}
                            onPress={() => router.push(`/projects?f=${folder.id}`)}
                            optionsContent={<FolderDirectOptions folder={folder} />}
                        />
                    ))}
                </ResponiveGrid>
            )}
        </>
    );
}
