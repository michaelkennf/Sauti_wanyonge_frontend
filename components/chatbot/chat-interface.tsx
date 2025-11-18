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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

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
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("soins") || lowerMessage.includes("médical") || lowerMessage.includes("santé")) {
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

    if (lowerMessage.includes("juridique") || lowerMessage.includes("avocat") || lowerMessage.includes("justice")) {
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
      lowerMessage.includes("soutien")
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

    if (lowerMessage.includes("droits") || lowerMessage.includes("que faire")) {
      return {
        content:
          "En tant que victime, vous avez plusieurs droits importants :\n\n• Le droit à la protection et à la sécurité\n• Le droit à des soins médicaux gratuits\n• Le droit à l'assistance juridique\n• Le droit à la confidentialité\n• Le droit de porter plainte\n\nVous pouvez déposer une plainte anonyme sur notre plateforme à tout moment. Souhaitez-vous que je vous guide dans cette démarche ?",
        resources: [],
      }
    }

    if (lowerMessage.includes("plainte") || lowerMessage.includes("signaler")) {
      return {
        content:
          "Pour déposer une plainte, vous pouvez utiliser notre formulaire sécurisé. Le processus est simple :\n\n1. Choisissez si vous souhaitez rester anonyme\n2. Décrivez l'incident avec autant de détails que possible\n3. Recevez un code confidentiel pour suivre votre dossier\n\nVotre plainte sera traitée en toute confidentialité. Voulez-vous commencer maintenant ?",
        resources: [],
      }
    }

    return {
      content:
        "Je suis là pour vous aider. Je peux vous renseigner sur :\n\n• Les centres de santé et soins médicaux\n• L'assistance juridique et vos droits\n• Le soutien psychologique\n• Comment déposer une plainte\n• Les services disponibles près de chez vous\n\nN'hésitez pas à me poser vos questions.",
      resources: [],
    }
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 shadow-lg overflow-hidden">
      <div className="flex flex-col h-[600px]">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
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
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
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
          </div>
        </ScrollArea>

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
