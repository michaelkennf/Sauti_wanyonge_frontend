"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Quote, TrendingUp } from "lucide-react"

const testimonials: { text: string; initials: string }[] = []

const stats: { label: string; value: string; icon: any }[] = []

export function TestimonialsStats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Témoignages et Statistiques</h2>
          <p className="text-lg text-muted-foreground">Données réelles à venir</p>
        </motion.div>

        {/* Testimonials - Empty for now */}
        {testimonials.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow"
              >
                <Quote className="h-8 w-8 text-primary mb-4 opacity-50" />
                <p className="text-muted-foreground leading-relaxed mb-4 italic">{testimonial.text}</p>
                <p className="text-sm font-semibold text-primary">— {testimonial.initials}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats - Empty for now but with improved design */}
        {stats.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 rounded-2xl text-center shadow-xl overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                    >
                      <Icon className="h-12 w-12 mx-auto mb-4 opacity-90" />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1, type: "spring" }}
                      className="text-5xl md:text-6xl font-bold mb-2 tracking-tight"
                    >
                      {stat.value}
                    </motion.div>
                    <p className="text-primary-foreground/90 font-medium text-lg">{stat.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {testimonials.length === 0 && stats.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="inline-block p-8 bg-card rounded-2xl shadow-lg border border-border/50">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
              <p className="text-xl text-muted-foreground">
                Les témoignages et statistiques seront affichés ici une fois les données collectées.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
