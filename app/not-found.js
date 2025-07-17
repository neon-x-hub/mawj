import React from 'react'
// I18N
import { t } from '@/app/i18n'


export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center h-screen text-center space-y-4'>
      <h1 className='text-3xl font-bold'>{t('messages.error.not_found')}</h1>
      <p>{t('messages.error.not_found_description')}</p>
    </div>
  )
}
