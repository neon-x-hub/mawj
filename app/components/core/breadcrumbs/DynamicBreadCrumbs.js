import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {t} from '@/app/i18n';

export default function DynamicBreadcrumbs({ basePath, baseLabel }) {
    const searchParams = useSearchParams();
    const folderParam = searchParams.get('f');
    const searchParam = searchParams.get('s');

    return (
        <Breadcrumbs className='mb-4 mx-3'>
            <BreadcrumbItem>
                <Link href="/">{t('common.home')}</Link>
            </BreadcrumbItem>

            <BreadcrumbItem>
                <Link href={basePath}>{baseLabel || t('common.projects')}</Link>
            </BreadcrumbItem>

            {folderParam && (
                <BreadcrumbItem>
                    <span>{t('common.folder')}: {decodeURIComponent(folderParam)}</span>
                </BreadcrumbItem>
            )}

            {searchParam && (
                <BreadcrumbItem>
                    <span>{t('actions.search')}: {decodeURIComponent(searchParam)}</span>
                </BreadcrumbItem>
            )}
        </Breadcrumbs>
    );
}
