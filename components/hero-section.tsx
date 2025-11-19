"use client"

import { Button } from "@/components/ui/button"
import { FileText, MessageCircle, Search } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent/80 to-primary/90 z-10" />
        {/* Optimisation: utiliser next/image pour les images */}
        <img
          src="/african-woman-looking-hopeful-and-strong--humanita.jpg"
          alt="Hero background"
          className="w-full h-full object-cover opacity-40"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-24 relative z-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-balance tracking-tight">
            Sauti ya Wa Nyonge
          </h1>

          <p className="text-xl md:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto text-pretty font-light">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="hover:scale-105 transition-transform duration-300">
              <Button
                asChild
                size="lg"
                className="bg-destructive text-white hover:bg-destructive/90 gap-2 min-w-[220px] h-14 text-lg font-semibold shadow-2xl btn-glow"
              >
                <Link href="/plainte">
                  <FileText className="h-5 w-5" />
                  {t('hero.depositComplaint')}
                </Link>
              </Button>
            </div>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary gap-2 min-w-[220px] h-14 text-lg font-semibold transition-all duration-300"
            >
              <Link href="/chatbot">
                <MessageCircle className="h-5 w-5" />
                {t('hero.talkToAssistant')}
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary gap-2 min-w-[220px] h-14 text-lg font-semibold transition-all duration-300"
            >
              <Link href="/suivi">
                <Search className="h-5 w-5" />
                {t('hero.trackComplaint')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
