"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatInterface } from "@/components/chatbot/chat-interface"
import { useTranslation } from "@/hooks/use-translation"

export default function ChatbotPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('chatbot.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              {t('chatbot.subtitle')}
            </p>
          </div>
          <ChatInterface />
        </div>
      </main>
      <Footer />
    </div>
  )
}
