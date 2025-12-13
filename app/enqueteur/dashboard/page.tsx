"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  CheckCircle,
  Activity,
  MapPin,
  Plus,
  LogOut
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { handleApiError } from "@/lib/api-error-handler"

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
  const router = useRouter()
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [loading, setLoading] = useState(true)

  // Statistiques
  const [stats, setStats] = useState({
    inProgressInvestigations: 0,
    completedInvestigations: 0
  })

  // Charger les données
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les plaintes depuis l'API (enquêtes = plaintes créées par l'enquêteur)
      const complaintsResponse = await apiService.getComplaints({
        page: 1,
        limit: 100,
        type: 'INVESTIGATOR_ASSISTED'
      })
      
      // Transformer les données de l'API au format attendu
      const transformedInvestigations: Investigation[] = complaintsResponse.data
        .filter((complaint: any) => complaint.type === 'INVESTIGATOR_ASSISTED')
        .map((complaint: any) => ({
          id: complaint.id,
          trackingCode: complaint.trackingCode,
          status: complaint.status,
          priority: complaint.priority,
          beneficiaryName: complaint.beneficiaryName || undefined,
          beneficiarySex: complaint.beneficiarySex || undefined,
          beneficiaryAge: complaint.beneficiaryAge || undefined,
          incidentType: complaint.beneficiaryNatureOfFacts || 'Non spécifié',
          incidentDate: complaint.incidentDate || complaint.createdAt,
          incidentAddress: complaint.geolocationAddress || `${complaint.geolocationProvince || ''}, ${complaint.geolocationTerritory || ''}`,
          geolocationProvince: complaint.geolocationProvince || '',
          geolocationTerritory: complaint.geolocationTerritory || '',
          investigatorComment: complaint.investigatorComment || undefined,
          createdAt: complaint.createdAt,
          updatedAt: complaint.updatedAt,
          evidence: complaint.evidence?.map((e: any) => ({
            type: e.type,
            fileName: e.fileName,
            fileSize: e.fileSize || 0
          })) || []
        }))

      setInvestigations(transformedInvestigations)

      // Vérifier le statut biométrique depuis l'utilisateur actuel
      const currentUser = apiService.getCurrentUser()
      const biometricRegistered = currentUser?.investigator?.biometricRegistered || false

      // Calculer les statistiques
      setStats({
        inProgressInvestigations: transformedInvestigations.filter(i => i.status === 'IN_PROGRESS').length,
        completedInvestigations: transformedInvestigations.filter(i => i.status === 'COMPLETED').length
      })
    } catch (error) {
      handleApiError(error, "Chargement des enquêtes", true)
    } finally {
      setLoading(false)
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
            
            <div className="flex items-center gap-2">
              <Link href="/enqueteur/formulaire">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle enquête
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  localStorage.removeItem('investigator_logged_in')
                  localStorage.removeItem('investigator_fingerprint_verified')
                  localStorage.removeItem('investigator_email')
                  router.push('/auth/investigator-login')
                }}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    <p className="text-sm font-medium text-muted-foreground">Total enquêtes terminées</p>
                    <p className="text-2xl font-bold text-green-500">{stats.completedInvestigations}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500/60" />
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
                        <TableHead>Numéro du dossier</TableHead>
                        <TableHead>Type d'incident</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investigations.map((investigation) => (
                        <TableRow key={investigation.id}>
                          <TableCell className="font-mono text-sm">
                            {investigation.trackingCode}
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">{investigation.incidentType}</div>
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
