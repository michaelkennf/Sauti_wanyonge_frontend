"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
    type: "Enlèvement",
    image: "/african-woman-looking-concerned-but-hopeful.jpg",
    description:
      "Privation de liberté par la force ou la ruse. Souvent lié à d'autres formes de violence et nécessite une intervention urgente.",
  },
  {
    type: "Menaces et intimidation",
    image: "/african-woman-showing-courage-and-determination.jpg",
    description:
      "Actes visant à inspirer la peur ou à contraindre une personne par la menace de violence physique ou psychologique.",
  },
  {
    type: "Mariage forcé",
    image: "/young-african-woman-looking-thoughtful-and-strong.jpg",
    description:
      "Union imposée sans le consentement libre et éclairé de l'une ou des deux parties. Violation des droits humains fondamentaux.",
  },
  {
    type: "Détention illégale",
    image: "/african-woman-advocate-for-justice.jpg",
    description:
      "Privation de liberté sans base légale. Peut s'accompagner d'autres formes de violence et nécessite une assistance juridique.",
  },
  {
    type: "Exploitation sexuelle",
    image: "/african-woman-survivor-with-hope-in-eyes.jpg",
    description:
      "Abus de position de vulnérabilité à des fins sexuelles, incluant la prostitution forcée et la traite des personnes.",
  },
  {
    type: "Violence domestique",
    image: "/african-woman-showing-inner-strength.jpg",
    description:
      "Violence physique, psychologique ou économique au sein du foyer. Cycle de violence nécessitant un soutien spécialisé.",
  },
]

export function ViolenceTypes() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())

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
        {selectedIndex !== null && (
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
                  {/* Front of card */}
                  <div
                    className={`absolute inset-0 p-6 rounded-lg border transition-all duration-300 flex items-center justify-center ${
                      selectedIndex === index
                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                        : "bg-card border-border hover:border-primary hover:shadow-lg"
                    }`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <p
                      className={`text-center font-medium transition-colors ${
                        selectedIndex === index ? "text-primary-foreground" : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {item.type}
                    </p>
                  </div>

                  <div
                    className="absolute inset-0 p-6 rounded-lg border bg-primary/95 text-primary-foreground border-primary shadow-lg flex items-center justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-sm text-center leading-relaxed">{item.description}</p>
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
