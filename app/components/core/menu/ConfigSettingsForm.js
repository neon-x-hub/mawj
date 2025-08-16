'use client'

import React, { useEffect, useState } from 'react';
import { t } from '@/app/i18n'
import { Alert, Button, Input, Select, SelectItem } from '@heroui/react';
import MaskedIcon from '../icons/Icon';
import { addToast } from '@heroui/react';

export default function ConfigSettingsForm() {
    const [initialConfig, setInitialConfig] = useState(null);
    const [baseFolder, setBaseFolder] = useState('');
    const [language, setLanguage] = useState('ar');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showRestartWarning, setShowRestartWarning] = useState(false);

    // Fetch current config
    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch('/api/v1/config');
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to fetch config');
                }
                const data = await res.json();

                // Store initial config for comparison
                setInitialConfig(data.data);
                setBaseFolder(data.data.baseFolder || '');
                setLanguage(data.data.language || 'ar');
            } catch (err) {
                console.error(err);
                addToast({
                    title: 'حدث خطأ في التحميل',
                    description: err.message,
                    color: 'danger',
                })
                setMessage(`❌ ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    // Check for config changes
    useEffect(() => {
        if (!initialConfig) return;

        const hasChanges =
            baseFolder !== initialConfig.baseFolder ||
            language !== initialConfig.language;

        const requiresRestart =
            baseFolder !== initialConfig.baseFolder;

        setShowRestartWarning(hasChanges && requiresRestart);
    }, [baseFolder, language, initialConfig]);

    async function handleSave() {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/v1/config/base_folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ baseFolder, language }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to save config');
            }

            // Update initial config to new saved values
            setInitialConfig({ baseFolder, language });
            setMessage(data.message || '✅ Config saved successfully');
            addToast({
                title: data.message,
                color: 'success'
            })
        } catch (err) {
            setMessage(`❌ ${err.message}`);
            addToast({
                title: 'حدث خطأ في الحفظ',
                description: err.message,
                color: 'danger',
            })
        } finally {
            setSaving(false);
        }
    }

    const hasChanges = initialConfig && (
        baseFolder !== initialConfig.baseFolder ||
        language !== initialConfig.language
    );

    if (loading) return <div className="p-4 text-sm">Loading settings...</div>;

    return (
        <div className="p-4 max-w-md space-y-4 text-sm">
            <div>
                <label className="text-lg mb-1 font-medium flex gap-2 items-center">
                    <MaskedIcon
                        src={'/icons/coco/line/Folder.svg'}
                        color={'#000000'}
                        height='23px'
                        width='23px'
                    />
                    {t('common.base_folder')}

                </label>
                <Input
                    type="text"
                    value={baseFolder}
                    onChange={(e) => setBaseFolder(e.target.value)}
                    placeholder="Enter base folder path"
                />
                <p className="text-xs text-gray-500 mt-1">
                    {t('common.base_folder_desc')}
                </p>
            </div>

            <div>
                <label className="text-lg mb-1 font-medium flex gap-2 items-center">
                    <MaskedIcon
                        src={'/icons/haicon/line/globe.svg'}
                        color={'#000000'}
                        height='20px'
                        width='20px'
                    />
                    {t('common.language')}

                </label>
                <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabledKeys={new Set(["en"])}
                    defaultSelectedKeys={["ar"]}
                >
                    <SelectItem key="ar">العربية</SelectItem>
                    <SelectItem key="en">English ({t('common.soon')})</SelectItem>
                </Select>
            </div>

            {showRestartWarning && (
                <Alert
                    title={t('messages.server_restart_required')}
                    description={t('messages.server_restart_required_desc')}
                    color='warning'
                />
            )}

            <div className="flex items-center gap-3">
                <Button
                    onClick={handleSave}
                    isDisabled={!showRestartWarning}
                    color={showRestartWarning ? 'primary' : 'default'}
                    className='text-white font-semibold'
                    isLoading={saving}
                    style={{
                        cursor: !showRestartWarning ? 'not-allowed' : 'pointer',
                    }}
                >
                    {saving ? 'Saving...' : t('actions.save')}
                </Button>
            </div>
        </div >
    );
}
