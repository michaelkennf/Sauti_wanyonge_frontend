"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Bot, Navigation, Eye, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslation } from "@/hooks/use-translation"
import Image from "next/image"

// Composant AboutCards - Version avec logos RDC, FONAREV et Nations Unies
export function AboutCards() {
  const { t } = useTranslation()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const features = [
    {
      icon: Shield,
      title: t('aboutCards.feature1.title'),
      description: t('aboutCards.feature1.description'),
      image: "/african-woman-anonymous-reporting.jpg",
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/50",
    },
    {
      icon: Bot,
      title: t('aboutCards.feature2.title'),
      description: t('aboutCards.feature2.description'),
      image: "/african-woman-using-chatbot-assistance.jpg",
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-500/50",
    },
    {
      icon: Navigation,
      title: t('aboutCards.feature3.title'),
      description: t('aboutCards.feature3.description'),
      image: "/african-woman-finding-support-services.jpg",
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/50",
    },
    {
      icon: Eye,
      title: t('aboutCards.feature4.title'),
      description: t('aboutCards.feature4.description'),
      image: "/african-woman-checking-case-status-confidently.jpg",
      color: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-500/50",
    },
    {
      icon: Heart,
      title: t('aboutCards.feature5.title'),
      description: t('aboutCards.feature5.description'),
      image: null, // Special case with logos
      color: "from-red-500/20 to-red-600/20",
      borderColor: "border-red-500/50",
      logos: [
        {
          src: "/logo%20rdc.png",
          alt: "Gouvernement RDC",
        },
        {
          src: "/logo%20fonarev.jpg",
          alt: "FONAREV",
        },
        {
          src: "/BCNUDH.jpeg",
          alt: "BCNUDH",
        },
        {
          src: "/UNICEF.png",
          alt: "UNICEF",
        },
        {
          src: "/unfa.png",
          alt: "UNFPA",
        },
        {
          src: "/onu_femme.png",
          alt: "ONU Femmes",
        },
        {
          src: "/PNUD_bleu.png",
          alt: "PNUD RDC",
        },
      ],
    },
  ]

  return (
    <section className="py-20 bg-secondary/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('aboutCards.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t('aboutCards.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <Card
                className={`relative h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 ${feature.borderColor} overflow-hidden`}
                onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
              >
                {/* Background Image */}
                {feature.image && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        selectedIndex === index ? 'opacity-30 blur-[2px]' : 'opacity-10 blur-md'
                      }`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} transition-opacity duration-500 ${
                      selectedIndex === index ? 'opacity-65' : 'opacity-60'
                    }`} />
                  </div>
                )}

                {/* Content */}
                <CardContent className="relative z-10 p-6 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                      <feature.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                    {feature.description}
                  </p>

                  {feature.logos && (
                    <div className="flex flex-wrap justify-center items-center gap-3 py-4">
                      {feature.logos.map((logo, logoIndex) => (
                        <div key={logoIndex} className="h-10 flex items-center justify-center">
                          <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={60}
                            height={40}
                            className="h-full w-auto max-w-[60px] object-contain opacity-70 hover:opacity-100 transition-opacity"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}