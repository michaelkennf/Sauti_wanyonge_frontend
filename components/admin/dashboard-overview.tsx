"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react"
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

const statsData = [
  { label: "Total des plaintes", value: "1,247", icon: FileText, color: "text-blue-600" },
  { label: "Plaintes urgentes", value: "23", icon: AlertCircle, color: "text-red-600" },
  { label: "Plaintes traitées", value: "892", icon: CheckCircle, color: "text-green-600" },
  { label: "En cours", value: "332", icon: Clock, color: "text-yellow-600" },
]

const monthlyData = [
  { month: "Jan", plaintes: 85 },
  { month: "Fév", plaintes: 92 },
  { month: "Mar", plaintes: 108 },
  { month: "Avr", plaintes: 95 },
  { month: "Mai", plaintes: 112 },
  { month: "Juin", plaintes: 125 },
]

const typeData = [
  { name: "Viol", value: 420, color: "#ef4444" },
  { name: "Harcèlement", value: 310, color: "#f59e0b" },
  { name: "Violence domestique", value: 280, color: "#8b5cf6" },
  { name: "Enlèvement", value: 150, color: "#3b82f6" },
  { name: "Autre", value: 87, color: "#6b7280" },
]

const zoneData = [
  { zone: "Kinshasa", plaintes: 450 },
  { zone: "Lubumbashi", plaintes: 280 },
  { zone: "Goma", plaintes: 220 },
  { zone: "Kisangani", plaintes: 180 },
  { zone: "Bukavu", plaintes: 117 },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vue d'ensemble</h1>
        <p className="text-muted-foreground">Statistiques et aperçu des plaintes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="plaintes" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Répartition géographique</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={zoneData}>
                <XAxis dataKey="zone" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Bar dataKey="plaintes" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
