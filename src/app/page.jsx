import { Suspense } from 'react'
import { CallToAction } from '@/components/homepageui/CallToAction'
import { Header } from '@/components/homepageui/Header'
import { Hero } from '@/components/homepageui/Hero'
import { PrimaryFeatures } from '@/components/homepageui/PrimaryFeatures'
import { SecondaryFeatures } from '@/components/homepageui/SecondaryFeatures'
import { Testimonials } from '@/components/homepageui/Testimonials'

export default function HomePage() {
  return (
    <Suspense>
      <div className="bg-white">
        <Header />
        <main>
          <Hero />
          <PrimaryFeatures />
          <SecondaryFeatures />
          <CallToAction />
          <Testimonials />
        </main>
      </div>
    </Suspense>
  );
}
