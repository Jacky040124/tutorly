import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { useTranslation } from 'react-i18next'

export default function BackToHomeButton() {
  const { t } = useTranslation()
  
  return (
    <Link href="/" aria-label="Home">
      <Button variant="outline" color="slate">
        {t('signin.backToHome')}
      </Button>
    </Link>
  )
}