"use client"

import { motion } from "framer-motion"
import { FileText, MessageCircle, BarChart3 } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      icon: FileText,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      color: "from-primary to-primary/80",
    },
    {
      icon: MessageCircle,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      color: "from-secondary to-secondary/80",
    },
    {
      icon: BarChart3,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      color: "from-accent to-accent/80",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">{t('howItWorks.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-border/50">
                {/* Icon with gradient background */}
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{step.title}</h3>

                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
