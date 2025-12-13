"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { apiService } from "@/lib/api"

const violenceTypes = [
  {
    type: "Viol",
    image: "/african-woman-survivor-showing-strength-and-resili.jpg",
    description:
      "Acte sexuel forcé sans consentement. Constitue un crime grave nécessitant une assistance médicale, juridique et psychologique immédiate.",
  },
  {
    type: "Harcèlement sexuel",
    image: "/african-woman-in-workplace-standing-strong.jpg",
    description:
      "Comportements non désirés à connotation sexuelle créant un environnement hostile ou intimidant au travail ou ailleurs.",
  },
  {
    type: "Zoophilie",
    image: "/african-woman-looking-concerned-but-hopeful.jpg",
    description:
      "Acte sexuel commis avec un animal. Crime grave nécessitant une intervention immédiate et un suivi spécialisé.",
  },
  {
    type: "Mariage forcé",
    image: "/young-african-woman-looking-thoughtful-and-strong.jpg",
    description:
      "Union imposée sans le consentement libre et éclairé de l'une ou des deux parties. Violation des droits humains fondamentaux.",
  },
  {
    type: "Proxénétisme",
    image: "/african-woman-advocate-for-justice.jpg",
    description:
      "Exploitation de la prostitution d'autrui. Crime grave nécessitant une protection immédiate et une assistance juridique.",
  },
  {
    type: "Attentat à la pudeur",
    image: "/african-woman-survivor-with-hope-in-eyes.jpg",
    description:
      "Actes d'exhibitionnisme ou d'attentat à la pudeur. Nécessite une intervention et un suivi appropriés.",
  },
  {
    type: "Autres crimes graves",
    image: "/african-woman-showing-inner-strength.jpg",
    description:
      "Tous les autres crimes graves liés aux violences sexuelles et basées sur le genre. Chaque cas est pris en charge avec le sérieux qu'il mérite.",
  },
]

export function ViolenceTypes() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const statsData = await apiService.getViolenceStats()
      const statsMap: Record<string, number> = {}
      statsData.forEach(stat => {
        statsMap[stat.violenceType] = stat.count
      })
      setStats(statsMap)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      // En cas d'erreur, initialiser avec des valeurs par défaut
      const defaultStats: Record<string, number> = {}
      violenceTypes.forEach(item => {
        defaultStats[item.type] = 0
      })
      setStats(defaultStats)
    } finally {
      setLoading(false)
    }
  }

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        {mounted && selectedIndex !== null && selectedIndex >= 0 && selectedIndex < violenceTypes.length && (
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.18, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={violenceTypes[selectedIndex].image || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover blur-[3px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Types de violences basées sur le genre
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Nous prenons en charge tous les types de violences. Cliquez pour en savoir plus.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {violenceTypes.map((item, index) => {
            const isFlipped = flippedCards.has(index)

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onMouseEnter={() => setSelectedIndex(index)}
                className="group relative h-48"
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                  onClick={() => toggleFlip(index)}
                  className="relative w-full h-full cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front of card - Description en haut, nom en bas */}
                  <div
                    className={`absolute inset-0 p-6 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
                      selectedIndex === index
                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                        : "bg-card border-border hover:border-primary hover:shadow-lg"
                    }`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex-1 flex items-start">
                      <p
                        className={`text-sm text-center leading-relaxed ${
                          selectedIndex === index ? "text-primary-foreground/90" : "text-muted-foreground"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <p
                        className={`text-center font-semibold text-lg transition-colors ${
                          selectedIndex === index ? "text-primary-foreground" : "text-foreground group-hover:text-primary"
                        }`}
                      >
                        {item.type}
                      </p>
                    </div>
                  </div>

                  {/* Back of card - Statistiques */}
                  <div
                    className="absolute inset-0 p-6 rounded-lg border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary shadow-lg flex flex-col items-center justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {!mounted || loading ? (
                      <div className="text-center">
                        <div className="text-5xl md:text-6xl font-bold mb-2">0</div>
                        <p className="text-sm text-center text-primary-foreground/90 mb-1">Cas signalés</p>
                        <p className="text-xs text-center text-primary-foreground/70 mt-2">{item.type}</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-5xl md:text-6xl font-bold mb-2">
                          {stats[item.type]?.toLocaleString() || 0}
                        </div>
                        <p className="text-sm text-center text-primary-foreground/90 mb-1">Cas signalés</p>
                        <p className="text-xs text-center text-primary-foreground/70 mt-2">{item.type}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
