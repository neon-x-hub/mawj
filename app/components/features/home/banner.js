import { t } from '@/app/i18n'
import Image from 'next/image'
import { Button } from '@heroui/react'

export default function HeroBanner() {
    return (
        <div className='w-full relative bg-white h-[300px] r30 overflow-hidden'>

            {/* Background Textures */}
            <Image src={'/bg/banner-right.png'} width={400} height={353} alt={'bg'} className='w-auto h-full absolute right-0 top-0 ' />

            <Image src={'/bg/banner-left.png'} width={400} height={353} alt={'bg'} className='w-auto h-full absolute left-0 top-0 opacity-85 ' />

            {/* Slogan */}
            <Image src={'/bg/slogan.png'} width={400} height={353} alt={'slogan'} className='w-auto h-[170px] absolute left-6 top-5' />

            {/* Action Button Group */}
            <div className='absolute bottom-6 left-6 flex gap-3'>
                <Button variant="light" color="primary" className='r30 px-6 text-lg font-semibold'>
                    {t('common.learn_more')}
                </Button>
                <Button variant="solid" color="primary" className='r30 text-white px-6 text-lg font-semibold'>
                    {t('common.get_started')}
                </Button>

            </div>
        </div>
    )
}
