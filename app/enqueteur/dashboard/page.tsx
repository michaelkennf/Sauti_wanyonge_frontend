"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Fingerprint,
  FileText,
  Clock,
  CheckCircle,
  Activity,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Plus,
  Eye,
  Download,
  MoreHorizontal,
  BarChart3,
  TrendingUp
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

// Types pour les enquêtes
interface Investigation {
  id: string
  trackingCode: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  beneficiaryName?: string
  beneficiarySex?: string
  beneficiaryAge?: number
  incidentType: string
  incidentDate: string
  incidentAddress: string
  geolocationProvince: string
  geolocationTerritory: string
  investigatorComment?: string
  createdAt: string
  updatedAt: string
  evidence: Array<{
    type: string
    fileName: string
    fileSize: number
  }>
}

export default function InvestigatorDashboardPage() {
  const { toast } = useToast()
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [loading, setLoading] = useState(true)

  // Statistiques
  const [stats, setStats] = useState({
    totalInvestigations: 0,
    pendingInvestigations: 0,
    inProgressInvestigations: 0,
    completedInvestigations: 0,
    urgentInvestigations: 0,
    biometricRegistered: true
  })

  // Charger les données
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Simulation des données - remplacer par un appel API réel
      const mockInvestigations: Investigation[] = [
        {
          id: "1",
          trackingCode: "SYW-2024-001",
          status: "COMPLETED",
          priority: "HIGH",
          beneficiaryName: "Victime Anonyme 1",
          beneficiarySex: "FEMALE",
          beneficiaryAge: 25,
          incidentType: "Violence sexuelle",
          incidentDate: "2024-01-15",
          incidentAddress: "Kinshasa, Gombe",
          geolocationProvince: "Kinshasa",
          geolocationTerritory: "Gombe",
          investigatorComment: "Enquête terminée avec succès",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-18T16:30:00Z",
          evidence: [
            { type: "PHOTO", fileName: "photo-victime.jpg", fileSize: 1024000 },
            { type: "AUDIO", fileName: "temoignage.mp3", fileSize: 2048000 }
          ]
        },
        {
          id: "2",
          trackingCode: "SYW-2024-002",
          status: "IN_PROGRESS",
          priority: "URGENT",
          beneficiaryName: "Victime Identifiée 1",
          beneficiarySex: "FEMALE",
          beneficiaryAge: 30,
          incidentType: "Violence domestique",
          incidentDate: "2024-01-16",
          incidentAddress: "Kinshasa, Limete",
          geolocationProvince: "Kinshasa",
          geolocationTerritory: "Limete",
          investigatorComment: "Enquête en cours, victime coopérative",
          createdAt: "2024-01-16T09:00:00Z",
          updatedAt: "2024-01-20T14:30:00Z",
          evidence: [
            { type: "PHOTO", fileName: "photo-victime.jpg", fileSize: 1024000 },
            { type: "VIDEO", fileName: "temoignage.mp4", fileSize: 5120000 }
          ]
        },
        {
          id: "3",
          trackingCode: "SYW-2024-003",
          status: "PENDING",
          priority: "MEDIUM",
          beneficiaryName: "Victime Anonyme 2",
          beneficiarySex: "MALE",
          beneficiaryAge: 22,
          incidentType: "Violence physique",
          incidentDate: "2024-01-17",
          incidentAddress: "Kinshasa, Kalamu",
          geolocationProvince: "Kinshasa",
          geolocationTerritory: "Kalamu",
          createdAt: "2024-01-17T14:30:00Z",
          updatedAt: "2024-01-17T14:30:00Z",
          evidence: []
        }
      ]

      setInvestigations(mockInvestigations)

      // Calculer les statistiques
      setStats({
        totalInvestigations: mockInvestigations.length,
        pendingInvestigations: mockInvestigations.filter(i => i.status === 'PENDING').length,
        inProgressInvestigations: mockInvestigations.filter(i => i.status === 'IN_PROGRESS').length,
        completedInvestigations: mockInvestigations.filter(i => i.status === 'COMPLETED').length,
        urgentInvestigations: mockInvestigations.filter(i => i.priority === 'URGENT').length,
        biometricRegistered: true
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Investigation['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'IN_PROGRESS':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Investigation['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">En attente</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-500">En cours</Badge>
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-500">Terminé</Badge>
      case 'CLOSED':
        return <Badge variant="outline">Fermé</Badge>
    }
  }

  const getPriorityBadge = (priority: Investigation['priority']) => {
    switch (priority) {
      case 'LOW':
        return <Badge variant="outline">Faible</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary">Moyen</Badge>
      case 'HIGH':
        return <Badge variant="default" className="bg-orange-500">Élevé</Badge>
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Fingerprint className="h-8 w-8" />
                Tableau de bord Enquêteur
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestion de vos enquêtes et investigations
              </p>
            </div>
            
            <Link href="/enqueteur/formulaire">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle enquête
              </Button>
            </Link>
          </div>

          {/* Statut biométrique */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Authentification biométrique</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.biometricRegistered ? "Enregistrée et active" : "Non enregistrée"}
                    </p>
                  </div>
                </div>
                <Badge variant={stats.biometricRegistered ? "default" : "destructive"}>
                  {stats.biometricRegistered ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total enquêtes</p>
                    <p className="text-2xl font-bold text-primary">{stats.totalInvestigations}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.pendingInvestigations}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En cours</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.inProgressInvestigations}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                    <p className="text-2xl font-bold text-green-500">{stats.completedInvestigations}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                    <p className="text-2xl font-bold text-red-500">{stats.urgentInvestigations}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques de performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Graphique de performance</p>
                    <p className="text-sm text-muted-foreground">Enquêtes terminées par mois</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendances des types d'incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Graphique des tendances</p>
                    <p className="text-sm text-muted-foreground">Types d'incidents les plus fréquents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des enquêtes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mes enquêtes ({investigations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Bénéficiaire</TableHead>
                        <TableHead>Type d'incident</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Preuves</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investigations.map((investigation) => (
                        <TableRow key={investigation.id}>
                          <TableCell className="font-mono text-sm">
                            {investigation.trackingCode}
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {investigation.beneficiaryName || "Anonyme"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {investigation.beneficiarySex === 'FEMALE' ? 'F' : 'M'}, {investigation.beneficiaryAge} ans
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">{investigation.incidentType}</div>
                          </TableCell>
                          
                          <TableCell>
                            {getPriorityBadge(investigation.priority)}
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(investigation.status)}
                              {getStatusBadge(investigation.status)}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {investigation.geolocationProvince} - {investigation.geolocationTerritory}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              {new Date(investigation.incidentDate).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(investigation.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              {investigation.evidence.length} fichier(s)
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {investigation.evidence.map(e => e.type).join(', ')}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
