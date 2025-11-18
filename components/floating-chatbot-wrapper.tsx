"use client"

import dynamic from "next/dynamic"

// Wrapper client pour FloatingChatbot - ne sera pas rendu côté serveur
const FloatingChatbot = dynamic(
  () => import("@/components/floating-chatbot").then(mod => ({ default: mod.FloatingChatbot })),
  { 
    ssr: false, // Ne pas rendre côté serveur
    loading: () => null // Pas de loading state pour le chatbot
  }
)

export function FloatingChatbotWrapper() {
  return <FloatingChatbot />
}

