import ConfigSettingsForm from '../components/core/menu/ConfigSettingsForm'
import { SectionHead } from '../components/shared/SectionHead'
import { t } from '@/app/i18n'
export default function Settings() {
    return (
        <>
            <SectionHead
                title={t('common.settings')}
                iconUrl={'/icons/coco/bold/Setting-3.svg'}
            />
            <ConfigSettingsForm />
            <h1 className='font-bold mt-3 text-lg'>{t('common.license')}</h1>
            <p className="max-w-[500px] break-words whitespace-pre-line text-black/65 text-sm px-4"> {/* How to make it with max width? the text is too long and flowing */}
                {t('messages.license_attr')}
            </p>
        </>
    )
}
