"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function AwarenessBanner() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent/90 z-10 opacity-95" />
        <img
          src="/african-women-community-support-and-solidarity.jpg"
          alt="Community support"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance tracking-tight">
            Brisons le silence
          </h2>

          <p className="text-xl md:text-2xl text-white/95 leading-relaxed font-light">
            Sauti ya wa nyonge — la voix de la vérité, la force du changement
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 gap-2 h-14 px-8 text-lg font-semibold shadow-2xl"
            >
              <Link href="/plainte">
                Agir maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
