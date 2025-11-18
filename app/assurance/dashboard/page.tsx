"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UserCheck,
  Search,
  Bot,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Sparkles,
  MessageSquare,
  FileSpreadsheet,
  FileImage,
  Loader2
} from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export default function AssuranceDashboardPage() {
  const { t } = useTranslation()
  const [aiQuestion, setAiQuestion] = useState("")
  const [responseType, setResponseType] = useState("text")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiResponse, setAiResponse] = useState("")

  // Données simulées
  const stats = {
    totalComplaints: 1247,
    assistedInvestigations: 892,
    urgentCases: 156,
    completedCases: 1034,
    averageTime: "3.2 jours"
  }

  const suggestedQuestions = [
    "Quelle est la répartition des types de violences par province ?",
    "Quels sont les délais moyens de traitement par région ?",
    "Comment évoluent les cas urgents sur les 6 derniers mois ?",
    "Quelle est l'efficacité des enquêteurs par zone géographique ?"
  ]

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return

    setIsAnalyzing(true)
    
    // Simulation d'analyse IA
    setTimeout(() => {
      setAiResponse(`Analyse générée pour: "${aiQuestion}"\n\nRésultats simulés basés sur les données disponibles.`)
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-primary flex items-center gap-3 mb-2">
                <UserCheck className="h-10 w-10" />
                {t('assurance.title')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('assurance.subtitle')}
              </p>
            </motion.div>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('assurance.totalComplaints')}
                      </p>
                      <p className="text-2xl font-bold">{stats.totalComplaints}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('assurance.assistedInvestigations')}
                      </p>
                      <p className="text-2xl font-bold">{stats.assistedInvestigations}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('assurance.urgentCases')}
                      </p>
                      <p className="text-2xl font-bold text-red-500">{stats.urgentCases}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('assurance.completedCases')}
                      </p>
                      <p className="text-2xl font-bold text-green-500">{stats.completedCases}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('assurance.averageTime')}
                      </p>
                      <p className="text-2xl font-bold">{stats.averageTime}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Assistant IA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {t('assurance.aiAssistant')}
                  </CardTitle>
                  <CardDescription>
                    {t('assurance.askQuestions')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">{t('assurance.yourQuestion')}</Label>
                    <Textarea
                      id="question"
                      placeholder={t('assurance.questionPlaceholder')}
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('assurance.responseType')}</Label>
                    <Select value={responseType} onValueChange={setResponseType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">{t('assurance.text')}</SelectItem>
                        <SelectItem value="chart">{t('assurance.chart')}</SelectItem>
                        <SelectItem value="excel">{t('assurance.excel')}</SelectItem>
                        <SelectItem value="pdf">{t('assurance.pdf')}</SelectItem>
                        <SelectItem value="recommendations">{t('assurance.recommendations')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleAIQuestion}
                    disabled={isAnalyzing || !aiQuestion.trim()}
                    className="w-full gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('assurance.analyzing')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t('assurance.analyze')}
                      </>
                    )}
                  </Button>

                  {/* Questions suggérées */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('assurance.suggestedQuestions')}</Label>
                    <div className="space-y-1">
                      {suggestedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left h-auto p-2"
                          onClick={() => setAiQuestion(question)}
                        >
                          <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="text-xs">{question}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Réponse IA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    {t('assurance.aiResponse')}
                  </CardTitle>
                  <CardDescription>
                    {t('assurance.aiGeneratedAnalysis')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {aiResponse ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">
                          {aiResponse}
                        </pre>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          {t('assurance.download')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileImage className="h-4 w-4 mr-2" />
                          {t('assurance.share')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('assurance.enterQuestion')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}