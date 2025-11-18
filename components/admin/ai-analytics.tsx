"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Download, Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  chart?: {
    type: "bar" | "line" | "pie"
    data: any[]
    title: string
  }
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Bonjour ! Je suis votre assistant d'analyse IA. Je peux vous aider à analyser les données des plaintes et générer des rapports. Que souhaitez-vous analyser ?",
    timestamp: new Date(),
  },
]

export function AIAnalytics() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        chart: response.chart,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 2000)
  }

  const generateAIResponse = (query: string) => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("évolution") || lowerQuery.includes("tendance") || lowerQuery.includes("mois")) {
      return {
        content:
          "Voici l'évolution du nombre de plaintes au cours des 6 derniers mois. On observe une tendance à la hausse avec un pic en juin.",
        chart: {
          type: "line" as const,
          title: "Évolution mensuelle des plaintes",
          data: [
            { month: "Jan", plaintes: 85 },
            { month: "Fév", plaintes: 92 },
            { month: "Mar", plaintes: 108 },
            { month: "Avr", plaintes: 95 },
            { month: "Mai", plaintes: 112 },
            { month: "Juin", plaintes: 125 },
          ],
        },
      }
    }

    if (lowerQuery.includes("type") || lowerQuery.includes("répartition") || lowerQuery.includes("catégorie")) {
      return {
        content:
          "Voici la répartition des plaintes par type. Le viol représente 34% des cas, suivi du harcèlement sexuel (25%) et de la violence domestique (22%).",
        chart: {
          type: "pie" as const,
          title: "Répartition par type de violence",
          data: [
            { name: "Viol", value: 420, color: "#ef4444" },
            { name: "Harcèlement", value: 310, color: "#f59e0b" },
            { name: "Violence domestique", value: 280, color: "#8b5cf6" },
            { name: "Enlèvement", value: 150, color: "#3b82f6" },
            { name: "Autre", value: 87, color: "#6b7280" },
          ],
        },
      }
    }

    if (lowerQuery.includes("zone") || lowerQuery.includes("géographique") || lowerQuery.includes("région")) {
      return {
        content:
          "Voici la distribution géographique des plaintes. Kinshasa enregistre le plus grand nombre de cas (450), suivi de Lubumbashi (280) et Goma (220).",
        chart: {
          type: "bar" as const,
          title: "Distribution géographique",
          data: [
            { zone: "Kinshasa", plaintes: 450 },
            { zone: "Lubumbashi", plaintes: 280 },
            { zone: "Goma", plaintes: 220 },
            { zone: "Kisangani", plaintes: 180 },
            { zone: "Bukavu", plaintes: 117 },
          ],
        },
      }
    }

    if (lowerQuery.includes("urgent") || lowerQuery.includes("priorité")) {
      return {
        content:
          "Analyse des niveaux d'urgence : 23 cas urgents nécessitent une attention immédiate, 156 cas de priorité moyenne, et 1068 cas de priorité faible.",
        chart: {
          type: "bar" as const,
          title: "Répartition par niveau d'urgence",
          data: [
            { urgence: "Urgent", nombre: 23 },
            { urgence: "Moyen", nombre: 156 },
            { urgence: "Faible", nombre: 1068 },
          ],
        },
      }
    }

    return {
      content:
        "Je peux vous aider à analyser :\n\n• L'évolution mensuelle des plaintes\n• La répartition par type de violence\n• La distribution géographique\n• Les niveaux d'urgence\n• Les statistiques de traitement\n\nQue souhaitez-vous analyser ?",
    }
  }

  const downloadChart = (chart: any) => {
    // Simulate chart download
    alert(`Téléchargement du graphique: ${chart.title}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analyse IA</h1>
        <p className="text-muted-foreground">Analysez les données avec l'intelligence artificielle</p>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Assistant d'analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-[600px]">
              <ScrollArea className="flex-1 pr-4">
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
                        <div className={`flex flex-col gap-3 max-w-[80%]`}>
                          <div
                            className={`rounded-lg px-4 py-3 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                          </div>

                          {message.chart && (
                            <Card className="border-border/50">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">{message.chart.title}</CardTitle>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadChart(message.chart)}
                                    className="gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Télécharger
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                  {message.chart.type === "line" && (
                                    <LineChart data={message.chart.data}>
                                      <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                                      <YAxis stroke="#888888" fontSize={12} />
                                      <Tooltip />
                                      <Line
                                        type="monotone"
                                        dataKey="plaintes"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                      />
                                    </LineChart>
                                  )}
                                  {message.chart.type === "bar" && (
                                    <BarChart data={message.chart.data}>
                                      <XAxis
                                        dataKey={message.chart.data[0].zone ? "zone" : "urgence"}
                                        stroke="#888888"
                                        fontSize={12}
                                      />
                                      <YAxis stroke="#888888" fontSize={12} />
                                      <Tooltip />
                                      <Bar
                                        dataKey={message.chart.data[0].plaintes ? "plaintes" : "nombre"}
                                        fill="hsl(var(--primary))"
                                        radius={[8, 8, 0, 0]}
                                      />
                                    </BarChart>
                                  )}
                                  {message.chart.type === "pie" && (
                                    <PieChart>
                                      <Pie
                                        data={message.chart.data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                      >
                                        {message.chart.data.map((entry: any, index: number) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                      </Pie>
                                      <Tooltip />
                                      <Legend />
                                    </PieChart>
                                  )}
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
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

              <div className="border-t border-border pt-4 mt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez votre question d'analyse..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Questions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-sm bg-transparent"
                onClick={() => setInput("Montre-moi l'évolution mensuelle")}
              >
                Évolution mensuelle
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm bg-transparent"
                onClick={() => setInput("Répartition par type")}
              >
                Répartition par type
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm bg-transparent"
                onClick={() => setInput("Distribution géographique")}
              >
                Distribution géographique
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm bg-transparent"
                onClick={() => setInput("Analyse des cas urgents")}
              >
                Cas urgents
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Exporter les données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exporter en Excel
              </Button>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exporter en PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
