"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SuggestedQuestions } from "./suggested-questions"
import { ResourceCard } from "./resource-card"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  resources?: Array<{
    title: string
    description: string
    contact?: string
    address?: string
  }>
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Bonjour, je suis votre assistant virtuel. Je suis là pour vous aider 24h/24. Comment puis-je vous assister aujourd'hui ?",
    timestamp: new Date(),
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll automatique vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    // Petit délai pour s'assurer que le DOM est mis à jour
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
      } else if (scrollAreaRef.current) {
        // Fallback: scroll manuel si messagesEndRef n'est pas disponible
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [messages, isLoading])

  const handleSend = async (message?: string) => {
    const messageToSend = message || input.trim()
    if (!messageToSend || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(messageToSend)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        resources: response.resources,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase().trim()
    
    // Détecter les réponses numériques (1, 2, 3, 4, 5)
    const numericMatch = lowerMessage.match(/^(\d+)$/)
    if (numericMatch) {
      const optionNumber = parseInt(numericMatch[1])
      
      switch (optionNumber) {
        case 1:
          return {
            content:
              "Voici les informations sur les centres de santé et soins médicaux disponibles :\n\nLes centres de santé offrent des services spécialisés pour les victimes de violences basées sur le genre, incluant :\n• Soins médicaux d'urgence\n• Examens médicaux légaux\n• Prévention des IST/VIH\n• Suivi médical post-traumatique\n• Consultations confidentielles et gratuites",
            resources: [
              {
                title: "Hôpital Général de Kinshasa",
                description: "Services d'urgence et soins spécialisés pour victimes de violences",
                contact: "+243 XXX XXX XXX",
                address: "Avenue de la Libération, Kinshasa",
              },
              {
                title: "Centre Médical Lisanga",
                description: "Consultations gratuites et confidentielles. Soutien psychologique disponible.",
                contact: "+243 XXX XXX XXX",
                address: "Quartier Ngaliema, Kinshasa",
              },
            ],
          }
        case 2:
          return {
            content:
              "Voici les informations sur l'assistance juridique et vos droits :\n\nEn tant que victime, vous avez plusieurs droits importants :\n• Le droit à la protection et à la sécurité\n• Le droit à des soins médicaux gratuits\n• Le droit à l'assistance juridique\n• Le droit à la confidentialité\n• Le droit de signaler un cas\n• Le droit à une procédure judiciaire équitable\n\nLes services juridiques peuvent vous aider à :\n• Comprendre vos droits\n• Préparer une plainte\n• Vous accompagner dans les procédures judiciaires\n• Obtenir une protection légale",
            resources: [
              {
                title: "Clinique Juridique de Kinshasa",
                description: "Conseil juridique gratuit et accompagnement dans les procédures judiciaires",
                contact: "+243 XXX XXX XXX",
                address: "Boulevard du 30 Juin, Kinshasa",
              },
              {
                title: "Association des Femmes Juristes",
                description: "Assistance juridique spécialisée pour les victimes de VBG. Accompagnement personnalisé.",
                contact: "+243 XXX XXX XXX",
                address: "Commune de la Gombe, Kinshasa",
              },
            ],
          }
        case 3:
          return {
            content:
              "Voici les informations sur le soutien psychologique :\n\nLe soutien psychologique est essentiel pour votre processus de guérison. Les services disponibles incluent :\n• Thérapie individuelle\n• Groupes de parole et de soutien\n• Accompagnement post-traumatique\n• Écoute active et empathique\n• Techniques de gestion du stress et de l'anxiété\n• Aide pour reconstruire la confiance en soi\n\nCes services sont confidentiels, gratuits et accessibles 24h/24.",
            resources: [
              {
                title: "Centre de Soutien Psychosocial Tumaini",
                description: "Thérapie individuelle et groupes de parole. Soutien psychologique gratuit.",
                contact: "+243 XXX XXX XXX",
                address: "Avenue Kabambare, Kinshasa",
              },
              {
                title: "Ligne d'Écoute Nationale",
                description: "Service d'écoute téléphonique 24h/24, 7j/7. Gratuit et confidentiel.",
                contact: "123 (gratuit)",
                address: "Service téléphonique",
              },
            ],
          }
        case 4:
          return {
            content:
              "Voici comment signaler un cas :\n\nPour signaler un cas, vous pouvez utiliser notre formulaire sécurisé. Le processus est simple et confidentiel :\n\n1. Choisissez si vous souhaitez rester anonyme ou fournir vos coordonnées\n2. Décrivez l'incident avec autant de détails que possible (date, lieu, circonstances)\n3. Ajoutez des preuves si disponibles (photos, vidéos, enregistrements audio)\n4. Recevez un code confidentiel unique pour suivre votre dossier\n5. Votre cas sera traité en toute confidentialité par notre équipe\n\nVotre signalement sera :\n• Traité avec respect et empathie\n• Protégé par la confidentialité\n• Suivi par des professionnels qualifiés\n• Transmis aux services compétents si nécessaire\n\nVoulez-vous commencer maintenant ?",
            resources: [],
          }
        case 5:
          return {
            content:
              "Voici les services disponibles près de chez vous :\n\nPour trouver les services les plus proches de votre localisation, j'ai besoin de votre autorisation pour accéder à votre géolocalisation. Une fois autorisée, je pourrai vous fournir :\n• Les centres de santé les plus proches\n• Les services juridiques disponibles dans votre zone\n• Les ONG et associations actives près de vous\n• Les numéros d'urgence locaux\n• Les horaires et contacts de chaque service\n\nSouhaitez-vous partager votre localisation pour obtenir ces informations personnalisées ?",
            resources: [],
          }
        default:
          return {
            content:
              "Je n'ai pas reconnu ce numéro. Veuillez répondre par 1, 2, 3, 4 ou 5 pour obtenir des informations sur :\n\n1. Les centres de santé et soins médicaux\n2. L'assistance juridique et vos droits\n3. Le soutien psychologique\n4. Comment signaler un cas\n5. Les services disponibles près de chez vous",
            resources: [],
          }
      }
    }

    if (lowerMessage.includes("soins") || lowerMessage.includes("médical") || lowerMessage.includes("santé") || lowerMessage === "1") {
      return {
        content:
          "Je comprends que vous avez besoin de soins médicaux. Voici les centres de santé disponibles près de chez vous qui peuvent vous aider :",
        resources: [
          {
            title: "Hôpital Général de Kinshasa",
            description: "Services d'urgence et soins spécialisés pour victimes de violences",
            contact: "+243 XXX XXX XXX",
            address: "Avenue de la Libération, Kinshasa",
          },
          {
            title: "Centre Médical Lisanga",
            description: "Consultations gratuites et confidentielles",
            contact: "+243 XXX XXX XXX",
            address: "Quartier Ngaliema, Kinshasa",
          },
        ],
      }
    }

    if (lowerMessage.includes("juridique") || lowerMessage.includes("avocat") || lowerMessage.includes("justice") || lowerMessage === "2" || lowerMessage.includes("droits")) {
      return {
        content:
          "Pour une assistance juridique, voici les services disponibles qui peuvent vous accompagner dans vos démarches :",
        resources: [
          {
            title: "Clinique Juridique de Kinshasa",
            description: "Conseil juridique gratuit et accompagnement dans les procédures",
            contact: "+243 XXX XXX XXX",
            address: "Boulevard du 30 Juin, Kinshasa",
          },
          {
            title: "Association des Femmes Juristes",
            description: "Assistance juridique spécialisée pour les victimes de VBG",
            contact: "+243 XXX XXX XXX",
            address: "Commune de la Gombe, Kinshasa",
          },
        ],
      }
    }

    if (
      lowerMessage.includes("psychologique") ||
      lowerMessage.includes("traumatisme") ||
      lowerMessage.includes("soutien") ||
      lowerMessage === "3"
    ) {
      return {
        content:
          "Le soutien psychologique est essentiel. Voici des services qui peuvent vous accompagner dans votre processus de guérison :",
        resources: [
          {
            title: "Centre de Soutien Psychosocial Tumaini",
            description: "Thérapie individuelle et groupes de parole",
            contact: "+243 XXX XXX XXX",
            address: "Avenue Kabambare, Kinshasa",
          },
          {
            title: "Ligne d'Écoute Nationale",
            description: "Service d'écoute téléphonique 24h/24",
            contact: "123 (gratuit)",
            address: "Service téléphonique",
          },
        ],
      }
    }

    if (lowerMessage.includes("plainte") || lowerMessage.includes("signaler") || lowerMessage === "4") {
      return {
        content:
          "Voici comment signaler un cas :\n\nPour signaler un cas, vous pouvez utiliser notre formulaire sécurisé. Le processus est simple et confidentiel :\n\n1. Choisissez si vous souhaitez rester anonyme ou fournir vos coordonnées\n2. Décrivez l'incident avec autant de détails que possible (date, lieu, circonstances)\n3. Ajoutez des preuves si disponibles (photos, vidéos, enregistrements audio)\n4. Recevez un code confidentiel unique pour suivre votre dossier\n5. Votre cas sera traité en toute confidentialité par notre équipe\n\nVotre signalement sera :\n• Traité avec respect et empathie\n• Protégé par la confidentialité\n• Suivi par des professionnels qualifiés\n• Transmis aux services compétents si nécessaire\n\nVoulez-vous commencer maintenant ?",
        resources: [],
      }
    }
    
    if (lowerMessage.includes("services") || lowerMessage.includes("près") || lowerMessage.includes("proche") || lowerMessage === "5") {
      return {
        content:
          "Voici les services disponibles près de chez vous :\n\nPour trouver les services les plus proches de votre localisation, j'ai besoin de votre autorisation pour accéder à votre géolocalisation. Une fois autorisée, je pourrai vous fournir :\n• Les centres de santé les plus proches\n• Les services juridiques disponibles dans votre zone\n• Les ONG et associations actives près de vous\n• Les numéros d'urgence locaux\n• Les horaires et contacts de chaque service\n\nSouhaitez-vous partager votre localisation pour obtenir ces informations personnalisées ?",
        resources: [],
      }
    }

    return {
        content:
          "Je suis là pour vous aider. Je peux vous renseigner sur :\n\n1. Les centres de santé et soins médicaux\n2. L'assistance juridique et vos droits\n3. Le soutien psychologique\n4. Comment signaler un cas\n5. Les services disponibles près de chez vous\n\nRépondez simplement par le numéro (1, 2, 3, 4 ou 5) pour obtenir plus d'informations sur l'option choisie.",
      resources: [],
    }
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 shadow-lg overflow-hidden">
      <div className="flex flex-col h-[70vh] max-h-[600px] min-h-[400px]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`flex flex-col gap-2 max-w-[80%]`}>
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line break-words">{message.content}</p>
                    </div>
                    {message.resources && message.resources.length > 0 && (
                      <div className="space-y-2">
                        {message.resources.map((resource, index) => (
                          <ResourceCard key={index} resource={resource} />
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground px-2">
                      {message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-accent-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="bg-secondary rounded-lg px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            )}
            {/* Point de référence pour le scroll automatique */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="px-6 pb-4">
            <SuggestedQuestions onSelect={handleSend} />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </Card>
  )
}
