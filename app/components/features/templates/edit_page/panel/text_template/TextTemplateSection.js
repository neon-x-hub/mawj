import React, { useState, useEffect } from 'react';
import { Alert, Chip, Code, Textarea } from '@heroui/react';
import { normalizeKey } from '@/app/lib/helpers/data/normalise';
import { t } from '@/app/i18n';
import { direction } from 'direction';
import PanelSectionTitle from '../SectionTitle';
import { colors } from '@/app/styles/designTokens';

export default function TextTemplateSection({ value, update }) {
    const [pid, setPid] = useState(null);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Safely extract `pid` from URL (client-side only)
    useEffect(() => {
        // Check if `window` is defined (client-side)
        if (typeof window === 'undefined') return;

        try {
            const queryParams = new URLSearchParams(window.location.search);
            const pidFromUrl = queryParams.get('pid');

            if (!pidFromUrl) {
                console.warn('No "pid" found in URL');
                return;
            }

            setPid(pidFromUrl);
        } catch (err) {
            console.error('Failed to parse URL:', err);
            setError(t('errors.url_parse_failed') || 'Failed to read URL parameters');
        }
    }, []);

    // Fetch metadata when `pid` is available
    useEffect(() => {
        if (!pid) return;

        const fetchMetadata = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/v1/projects/${pid}/data/metadata`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                setColumns(data.columns || []);
            } catch (err) {
                console.error('Failed to fetch metadata:', err);
                setError(t('errors.metadata_fetch_failed') || 'Failed to load columns');
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [pid]);

    const handleChipClick = (columnName) => {
        const normalized = `{{${normalizeKey(columnName)}}}`;
        update({ templateText: value.templateText ? value.templateText + normalized : '' + normalized });
    };

    // Don't render if critical data is missing
    if (error) {
        return <div className="text-red-500 text-sm p-2">{error}</div>;
    }

    return (
        <section className="flex flex-col gap-2">
            <PanelSectionTitle
                title={t("layers.text.template")}
                iconSrc="/icons/haicon/line/brackets-curly.svg"
                iconOptions={{ height: "19px", width: "19px" }}
            />

            <Textarea
                placeholder={t("layers.text.template_placeholder")}
                value={value.templateText}
                onValueChange={(value) => update({ templateText: value })}
                style={{
                    direction: direction(value.templateText) === 'ltr' ? 'ltr' : 'rtl',
                }}
            />

            {/* Column Chips */}
            {pid && (
                <div className="mb-2">
                    <div className="text-sm text-gray-700 mb-2">
                        {t('layers.text.insert_column')}
                    </div>

                    {loading ? (
                        <div className="text-gray-500">{t('common.loading')}...</div>
                    ) : (
                        <div className="flex flex-wrap gap-2 w-full items-center justify-center">
                            {columns.map((col) => (
                                <Chip
                                    key={col}
                                    onClick={() => handleChipClick(col)}
                                    className="cursor-pointer transition-colors duration-300 hover:bg-primary hover:text-white border-small"
                                    size='sm'
                                    color='primary'
                                    variant='bordered'

                                >
                                    {col}
                                </Chip>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Template Tips */}
            {/* TODO: i18n setup */}
            <details>
                <summary className="cursor-pointer font-medium text-sm">
                    شروط كتابة القوالب
                </summary>

                <div className="mt-2 pr-2 text-xs leading-relaxed space-y-2">

                    <p>
                        • استخدم الصيغة <Code className="bg-gray-100 px-1 rounded">{'{{column_name}}'}</Code>
                        <span className="ml-1">(لا مسافات داخل القوسين)</span>
                    </p>

                    <p>
                        • إذا كان اسم العمود يحتوي فراغًا مثل <Code className="bg-gray-100 px-1 rounded">First Name</Code>
                        استبدل الفراغ بـ <Code className="bg-gray-100 px-1 rounded">_</Code> → <Code className="bg-gray-100 px-1 rounded">{'{{First_Name}}'}</Code>
                    </p>

                    <p>
                        • أسماء الأعمدة يجب أن تكون بالإنجليزية فقط — مثال غير مقبول:
                        <Code className="bg-gray-100 px-1 rounded line-through">{'{{اسم}}'}</Code>
                    </p>

                    <Alert
                        title="ملاحظة"
                        description={
                            <>
                                القوالب < strong > لن تعمل</strong> إذا وُجدت مسافات أو أحرف عربية داخل القوسين
                            </>
                        }
                        hideIcon={true}
                        classNames={{
                            description: 'text-sm'
                        }}
                    />

                </div>
            </details>


        </section >
    );
}
