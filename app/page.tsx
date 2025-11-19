"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Lazy load les composants lourds pour améliorer le temps de chargement initial
const HowItWorks = dynamic(() => import("@/components/how-it-works").then(mod => ({ default: mod.HowItWorks })), {
  loading: () => <div className="h-64 animate-pulse bg-muted" />,
})

const AboutCards = dynamic(() => import("@/components/about-cards").then(mod => ({ default: mod.AboutCards })), {
  loading: () => <div className="h-64 animate-pulse bg-muted" />,
})

const ViolenceTypes = dynamic(() => import("@/components/violence-types").then(mod => ({ default: mod.ViolenceTypes })), {
  loading: () => <div className="h-64 animate-pulse bg-muted" />,
})

const TestimonialsStats = dynamic(() => import("@/components/testimonials-stats").then(mod => ({ default: mod.TestimonialsStats })), {
  loading: () => <div className="h-64 animate-pulse bg-muted" />,
})

const AwarenessBanner = dynamic(() => import("@/components/awareness-banner").then(mod => ({ default: mod.AwarenessBanner })), {
  loading: () => <div className="h-32 animate-pulse bg-muted" />,
})

// FloatingChatbot wrapper client pour éviter le SSR
import { FloatingChatbotWrapper } from "@/components/floating-chatbot-wrapper"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted" />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted" />}>
          <AboutCards />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted" />}>
          <ViolenceTypes />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted" />}>
          <TestimonialsStats />
        </Suspense>
        <Suspense fallback={<div className="h-32 animate-pulse bg-muted" />}>
          <AwarenessBanner />
        </Suspense>
      </main>
      <Footer />
      <FloatingChatbotWrapper />
    </div>
  )
}
