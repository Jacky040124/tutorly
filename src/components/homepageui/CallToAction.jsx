'use client'

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';

export function CallToAction() {
  const { t } = useTranslation('landing');

  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-green-600 py-32"
    >
      <div 
        className="absolute inset-0 bg-slate-900 opacity-50"
        aria-hidden="true"
      />
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            {t('callToAction.title')}
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            {t('callToAction.subtitle')}
          </p>
          <Button href="/auth/signup" color="white" className="mt-10">
            {t('callToAction.button')}
          </Button>
        </div>
      </Container>
    </section>
  )
} 