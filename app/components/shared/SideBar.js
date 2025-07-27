// I18N
import { t, getLang } from '@/app/i18n'

// Design Tokens
import { colors } from '@/app/styles/designTokens'

import Image from 'next/image'
import React from 'react'
import Link from 'next/link'


import MaskedIcon from '../core/icons/Icon'

const menuItems = [
    { icon: '/icons/coco/line/Home-2.svg', label: t('common.home'), href: '/' },
    { icon: '/icons/coco/line/bag.svg', label: t('common.projects'), href: '/projects' },
    { icon: '/icons/coco/line/Document.svg', label: t('common.templates'), href: '/templates' },
    //{ icon: '/icons/coco/line/Text.svg', label: t('common.fonts'), href: '/fonts' },
    { icon: '/icons/coco/line/Setting-3.svg', label: t('common.settings'), href: '/settings' },
    /* { icon: '/icons/coco/line/Discovery.svg', label: t('common.learn'), href: '/learn' }
 */]


export default function SideBar() {

    return (
        <div className="bg-white shadow-lg transition-all duration-700 hover:w-[230px] w-16 shrink-0 flex flex-col justify-between group h-full r30 p-1">
            {/* Top Section */}
            <div>

                {/* Logo */}
                <div className="flex items-center justify-center h-16 mt-5
                ">
                    <Image src="/logo/png/colored.png" alt="Logo" width={40} height={40} className="w-7 h-auto" />
                </div>

                {/* Menu Items */}
                <ul className="space-y-3 mt-5">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <MenuItem icon={item.icon} label={item.label} href={item.href} />
                        </li>
                    ))}
                </ul>
            </div>

            {/* Bottom Icon */}
            <div className="mb-3" >
                <MenuItem icon="/icons/coco/line/Discovery.svg" label={t('common.learn')} href="/learn" />
            </div>
        </div>
    )
}



const MenuItem = ({ icon, label, href }) => {
    return (
        <Link href={href} className="flex items-center gap-4 px-4 py-2 transition rounded-lg hover:bg-blue-50">
            {/*             <Image src={icon} alt={label} width={24} height={24} className="w-[26px] h-[26px]" />
 */}
            <MaskedIcon src={icon} color={colors.primary} className="w-[26px] h-[26px] flex-shrink-0" />
            {/* Label */}
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 font-normal text-lg">
                {label}
            </span>
        </Link>
    )
}
