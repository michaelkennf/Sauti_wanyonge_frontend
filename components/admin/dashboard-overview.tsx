"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, AlertCircle, CheckCircle, Clock, TrendingUp, MapPin, BarChart3, Activity } from "lucide-react"
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
  Area,
  AreaChart,
  CartesianGrid
} from "recharts"
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { logger } from "@/lib/logger"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download } from "lucide-react"

const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#6b7280', '#ec4899']

export function DashboardOverview() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("6months")

  useEffect(() => {
    loadAnalytics()
  }, [selectedProvince, dateRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      
      if (selectedProvince !== "all") {
        filters.province = selectedProvince
      }

      if (dateRange === "3months") {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        filters.startDate = threeMonthsAgo.toISOString().split('T')[0]
      } else if (dateRange === "1year") {
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        filters.startDate = oneYearAgo.toISOString().split('T')[0]
      }

      const data = await apiService.getDashboardAnalytics(filters)
      setAnalytics(data)
    } catch (error: any) {
      logger.error('Erreur lors du chargement des statistiques', error, 'DashboardOverview')
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const statsData = analytics ? [
    { 
      label: "Total des cas", 
      value: analytics.overview.total.toLocaleString(), 
      icon: FileText, 
      color: "text-blue-600",
      change: "+12%"
    },
    { 
      label: "Cas urgents", 
      value: analytics.overview.urgent.toLocaleString(), 
      icon: AlertCircle, 
      color: "text-red-600",
      change: "+5%"
    },
    { 
      label: "Cas traités", 
      value: analytics.overview.completed.toLocaleString(), 
      icon: CheckCircle, 
      color: "text-green-600",
      change: `+${analytics.metrics.completionRate.toFixed(1)}%`
    },
    { 
      label: "En cours", 
      value: analytics.overview.inProgress.toLocaleString(), 
      icon: Clock, 
      color: "text-yellow-600",
      change: "-3%"
    },
  ] : []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vue d'ensemble</h1>
          <p className="text-muted-foreground">Statistiques et aperçu des cas</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 derniers mois</SelectItem>
              <SelectItem value="6months">6 derniers mois</SelectItem>
              <SelectItem value="1year">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les provinces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les provinces</SelectItem>
              <SelectItem value="Kinshasa">Kinshasa</SelectItem>
              <SelectItem value="Kongo-Central">Kongo-Central</SelectItem>
              <SelectItem value="Kwango">Kwango</SelectItem>
              <SelectItem value="Kwilu">Kwilu</SelectItem>
              <SelectItem value="Mai-Ndombe">Mai-Ndombe</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-muted-foreground">{stat.change}</span>
                    </div>
                  )}
                </div>
                <div className={`h-12 w-12 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Métriques de performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taux de complétion</span>
                <span className="text-2xl font-bold">{analytics.metrics.completionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${analytics.metrics.completionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Temps moyen de traitement</span>
                <span className="text-2xl font-bold">{analytics.metrics.averageProcessingTime.toFixed(1)} jours</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition par statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "En attente", value: analytics.overview.pending },
                    { name: "En cours", value: analytics.overview.inProgress },
                    { name: "Complétés", value: analytics.overview.completed },
                    { name: "Fermés", value: analytics.overview.closed }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {[analytics.overview.pending, analytics.overview.inProgress, analytics.overview.completed, analytics.overview.closed].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle avec zone */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>Tendance des cas signalés sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.trends.monthly}>
                <defs>
                  <linearGradient id="colorCas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="cas" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCas)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par type de violence */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
            <CardDescription>Distribution des types de violences signalées</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={analytics.distributions.byType} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.distributions.byType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendance hebdomadaire */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Tendance hebdomadaire</CardTitle>
            <CardDescription>Évolution sur les 7 dernières semaines</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trends.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="cas" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par statut de traitement */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Statut de traitement</CardTitle>
            <CardDescription>Répartition des cas selon leur statut de traitement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.distributions.byTreatmentStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition géographique */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Répartition géographique
            </CardTitle>
            <CardDescription>Top 10 provinces par nombre de cas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.distributions.byProvince} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="zone" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="cas" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
