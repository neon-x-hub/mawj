'use client'

import React, { useEffect, useState } from 'react'
import { t } from '@/app/i18n'
import { Select, SelectItem, Progress, Checkbox } from '@heroui/react'

export default function GenerateVideoModal({
    project,
    formData,
    handleInputChange,
    handleGenerate,
    isProcessing,
    progress
}) {
    const [metadata, setMetadata] = useState(null)
    const [loadingMetadata, setLoadingMetadata] = useState(true)

    // Estimated render times (per video, in seconds) by format
    const renderTimeMap = {
        mp4: 3.0,
        mkv: 3.5,
        webm: 2.8
    }
    /*
        mp4 with h264 1M bitrate a video of length 12 mins took 120 s
        mp4 with h265 1M bitrate a video of length 12 mins took 141 s
        mkv with h264 1M bitrate a video of length 12 mins took  94 s
        mkv with h265 1M bitrate a video of length 12 mins took 146 s
    */

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await fetch(`/api/v1/projects/${project.id}/data/metadata`)
                if (!res.ok) throw new Error('Failed to fetch metadata')
                const data = await res.json()
                setMetadata(data)
            } catch (err) {
                console.error('Metadata fetch error:', err)
            } finally {
                setLoadingMetadata(false)
            }
        }
        fetchMetadata()
    }, [project.id])

    // Seconds needed to process 1 minute of video (depends on codec/bitrate/GPU)
    const baseSpeedPerMin = {
        h264: 10,
        h265: 12,
    };
    const bitrateFactor = {
        "1M": 0.9,
        "3M": 1.0,
        "5M": 1.1,
        "8M": 1.25,
        "12M": 1.4,
    };
    const gpuFactor = formData.useGpu && formData.gpuBrand === "nvidia" ? 0.6 : 1.0;

    const codecSpeed = baseSpeedPerMin[formData.codec || "h264"] || 10;
    const bitrateSpeed = bitrateFactor[formData.videoBitrate || "5M"] || 1.0;

    const secondsPerMinute = (codecSpeed * bitrateSpeed * gpuFactor).toFixed(1);


    return (
        <div className="space-y-4">
            {/* Progress Bar */}
            {isProcessing && (
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                            {t('common.progress')}: {Math.round(progress)}%
                        </span>
                    </div>
                    <Progress
                        value={progress}
                        minValue={0}
                        maxValue={100}
                        color="primary"
                        className="w-full"
                    />
                </div>
            )}

            {/* Metadata & Estimated Time */}
            <div className="p-2 bg-gray-50 rounded border text-sm min-h-[80px]">
                {loadingMetadata ? (
                    <div className="animate-pulse space-y-1">
                        <p><strong>{t('common.total_videos')}:</strong> ...</p>
                        <p><strong>{t('common.completed_f')}:</strong> ...</p>
                        <p><strong>{t('common.remaining_f')}:</strong> ...</p>
                        <p className="mt-1 text-primary-600 font-medium">
                            ⏱ <strong>{t('common.estimated_time')}:</strong> ...
                        </p>
                    </div>
                ) : (
                    <>
                        <p><strong>{t('common.total_videos')}:</strong> {metadata.total}</p>
                        <p><strong>{t('common.completed_f')}:</strong> {metadata.done}</p>
                        <p><strong>{t('common.remaining_f')}:</strong> {metadata.total - metadata.done}</p>
                        ⚡ <strong>{t('common.estimated_speed')}:</strong> {secondsPerMinute} ثانية لكل دقيقة فيديو
                    </>
                )}
            </div>

            {/* Output Format */}
            <Select
                className="w-full"
                label={t('common.output_format')}
                description="اختر صيغة إخراج الفيديو النهائي."
                selectedKeys={new Set([formData.format || 'mp4'])}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] || 'mp4'
                    handleInputChange({ target: { name: 'format', value } })
                }}
                disabled={isProcessing}
                disabledKeys={new Set(['webm'])}
            >
                <SelectItem key="mp4">MP4</SelectItem>
                <SelectItem key="mkv">MKV</SelectItem>
                <SelectItem key="webm">WebM - {t('common.soon')}</SelectItem>
            </Select>

            {/* Codec */}
            <Select
                className="w-full"
                label={t('common.codec')}
                description="اختر الترميز الذي سيتم استخدامه لضغط الفيديو."
                selectedKeys={new Set([formData.codec || 'h264'])}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] || 'h264'
                    handleInputChange({ target: { name: 'codec', value } })
                }}
                disabled={isProcessing}
                disabledKeys={new Set(['vp9', 'av1'])}
            >
                <SelectItem key="h264">H.264</SelectItem>
                <SelectItem key="h265">H.265 / HEVC</SelectItem>
                <SelectItem key="vp9">VP9 - {t('common.soon')}</SelectItem>
                <SelectItem key="av1">AV1 - {t('common.soon')}</SelectItem>
            </Select>

            {/* Video Bitrate (Select instead of NumberInput) */}
            <Select
                className="w-full"
                label={t('common.video_bitrate')}
                description={
                    <details>
                        <summary className="cursor-pointer">
                            {t('tips.quick_tip') + ' : ' + t('tips.video_bitrate')}
                        </summary>
                        <span className="whitespace-pre-line">
                            {t('tips.video_bitrate_explanation') || `
• معدل البت للفيديو يتحكم في الجودة وحجم الملف.
• معدل بت أعلى = صورة أوضح لكن حجم ملف أكبر.
• لليوتيوب، القيم بين 5M و 8M مناسبة لفيديوهات بدقة 1080p.
• المعدلات العالية جدًا قد لا تقدم فرقًا ملحوظًا لمعظم المحتوى.
                `}
                        </span>
                    </details>
                }
                selectedKeys={new Set([formData.videoBitrate ?? "5M"])}
                onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    handleInputChange({ target: { name: 'videoBitrate', value } });
                }}
                disabled={isProcessing}
            >
                <SelectItem key="1M">1000 kbps (منخفض)</SelectItem>
                <SelectItem key="3M">3000 kbps (متوسط)</SelectItem>
                <SelectItem key="5M">5000 kbps (عالي)</SelectItem>
                <SelectItem key="8M">8000 kbps (جودة عالية جداً)</SelectItem>
                <SelectItem key="12M">12000 kbps (إنتاج احترافي)</SelectItem>
            </Select>



            {/* Checkboxes */}
            <div className='space-y-2 flex flex-col'>
                <Checkbox
                    isSelected={formData.useTrimming ?? true}
                    onValueChange={(checked) =>
                        handleInputChange({ target: { name: 'useTrimming', value: checked } })
                    }
                    description="قم بتشغيل هذا الخيار لقص الفيديوهات حسب الإعدادات المحددة."
                    isDisabled={isProcessing}
                    classNames={{
                        icon: "after:bg-primary after:text-background text-background"
                    }}
                >
                    {t('common.use_trimming')}
                </Checkbox>

                <Checkbox
                    isSelected={formData.useGpu ?? false}
                    onValueChange={(checked) =>
                        handleInputChange({ target: { name: 'useGpu', value: checked } })
                    }
                    description="استخدم بطاقة الرسوميات لتسريع عملية المعالجة."
                    isDisabled={isProcessing}
                    classNames={{
                        icon: "after:bg-primary after:text-background text-background"
                    }}
                >
                    {t('common.use_gpu')}
                </Checkbox>

                {/* GPU Brand Selection (only when GPU is enabled) */}
                {formData.useGpu && (
                    <Select
                        className="w-full"
                        label="نوع بطاقة الرسوميات"
                        description="حدد نوع بطاقة الرسوميات لديك للاستفادة المثلى من المعالجة."
                        selectedKeys={new Set([formData.gpuBrand || 'nvidia'])}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0]
                            handleInputChange({ target: { name: 'gpuBrand', value } })
                        }}
                        disabled={isProcessing}
                        disabledKeys={['amd', 'intel']}
                    >
                        <SelectItem key="nvidia">NVIDIA</SelectItem>
                        <SelectItem key="amd">AMD - {t('common.soon')}</SelectItem>
                        <SelectItem key="intel">Intel - {t('common.soon')}</SelectItem>
                    </Select>
                )}

                <Checkbox
                    isSelected={formData.keepThumbnails ?? false}
                    onValueChange={(checked) =>
                        handleInputChange({ target: { name: 'keepThumbnails', value: checked } })
                    }
                    description="احتفظ بالصور المصغرة التي تم إنشاؤها مسبقًا حتى بعد المعالجة."
                    isDisabled={isProcessing}
                    classNames={{
                        icon: "after:bg-primary after:text-background text-background"
                    }}
                >
                    {t('common.keep_thumbnails')}
                </Checkbox>

                {/* Regenerate Done Checkbox */}
                <Checkbox
                    isSelected={formData.regenerate_done ?? false}
                    onValueChange={(isChecked) =>
                        handleInputChange({ target: { name: 'regenerate_done', value: isChecked } })
                    }
                    description="أعد معالجة المقاطع المكتملة مسبقاً."
                    isDisabled={isProcessing}
                    classNames={{
                        icon: "after:bg-primary after:text-background text-background"
                    }}
                >
                    {t('actions.regenerate_done')}
                </Checkbox>
            </div>
        </div>
    )
}
