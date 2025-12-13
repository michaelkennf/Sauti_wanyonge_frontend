"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  Send,
  MoreHorizontal,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckSquare
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"
import { handleApiError } from "@/lib/api-error-handler"

// Types pour les plaintes
interface Complaint {
  id: string
  trackingCode: string
  type: 'VICTIM_DIRECT' | 'INVESTIGATOR_ASSISTED'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  beneficiaryName?: string
  beneficiarySex?: string
  beneficiaryAge?: number
  incidentType: string
  incidentDate: string
  incidentDescription: string
  incidentAddress: string
  geolocationProvince: string
  geolocationTerritory: string
  geolocationVillage?: string
  investigatorComment?: string
  createdAt: string
  updatedAt: string
  investigator?: {
    name: string
    badgeNumber: string
  }
  evidence: Array<{
    type: string
    fileName: string
    fileSize: number
  }>
  services: Array<{
    serviceType: string
    status: string
    notes?: string
  }>
}

interface Service {
  id: string
  complaintId: string
  serviceType: 'MEDICAL' | 'PSYCHOLOGICAL' | 'LEGAL' | 'PROTECTION' | 'SHELTER' | 'SOCIO_ECONOMIC' | 'OTHER'
  status: 'REQUESTED' | 'IN_PROGRESS' | 'PROVIDED' | 'REJECTED' | 'CLOSED'
  notes?: string
  createdAt: string
}

export default function NGODashboardPage() {
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [newService, setNewService] = useState({
    serviceType: 'MEDICAL' as Service['serviceType'],
    notes: ''
  })

  // Statistiques
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    completedComplaints: 0,
    urgentComplaints: 0,
    totalServices: 0,
    activeServices: 0
  })

  // Charger les données
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les plaintes depuis l'API
      const complaintsResponse = await apiService.getComplaints({
        page: 1,
        limit: 100
      })
      
      // Transformer les données de l'API au format attendu
      const transformedComplaints: Complaint[] = complaintsResponse.data.map((complaint: any) => ({
        id: complaint.id,
        trackingCode: complaint.trackingCode,
        type: complaint.type,
        status: complaint.status,
        priority: complaint.priority,
        beneficiaryName: complaint.beneficiaryName || undefined,
        beneficiarySex: complaint.beneficiarySex || undefined,
        beneficiaryAge: complaint.beneficiaryAge || undefined,
        incidentType: complaint.beneficiaryNatureOfFacts || 'Non spécifié',
        incidentDate: complaint.incidentDate || complaint.createdAt,
        incidentDescription: complaint.beneficiaryNatureOfFacts || '',
        incidentAddress: complaint.geolocationAddress || `${complaint.geolocationProvince || ''}, ${complaint.geolocationTerritory || ''}`,
        geolocationProvince: complaint.geolocationProvince || '',
        geolocationTerritory: complaint.geolocationTerritory || '',
        geolocationVillage: complaint.geolocationVillage || undefined,
        investigatorComment: complaint.investigatorComment || undefined,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        investigator: complaint.investigator ? {
          name: complaint.investigator.name || '',
          badgeNumber: complaint.investigator.badgeNumber || ''
        } : undefined,
        evidence: complaint.evidence?.map((e: any) => ({
          type: e.type,
          fileName: e.fileName,
          fileSize: e.fileSize || 0
        })) || [],
        services: complaint.services?.map((s: any) => ({
          serviceType: s.serviceType,
          status: s.status,
          notes: s.notes
        })) || []
      }))

      setComplaints(transformedComplaints)

      // Extraire les services de toutes les plaintes
      const allServices: Service[] = []
      transformedComplaints.forEach(complaint => {
        complaint.services.forEach((service, index) => {
          allServices.push({
            id: `${complaint.id}-${index}`,
            complaintId: complaint.id,
            serviceType: service.serviceType as Service['serviceType'],
            status: service.status as Service['status'],
            notes: service.notes,
            createdAt: complaint.createdAt
          })
        })
      })
      setServices(allServices)

      // Calculer les statistiques
      setStats({
        totalComplaints: transformedComplaints.length,
        pendingComplaints: transformedComplaints.filter(c => c.status === 'PENDING').length,
        inProgressComplaints: transformedComplaints.filter(c => c.status === 'IN_PROGRESS').length,
        completedComplaints: transformedComplaints.filter(c => c.status === 'COMPLETED').length,
        urgentComplaints: transformedComplaints.filter(c => c.priority === 'URGENT').length,
        totalServices: allServices.length,
        activeServices: allServices.filter(s => s.status === 'IN_PROGRESS').length
      })
    } catch (error) {
      handleApiError(error, "Chargement des données", true)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les plaintes
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.incidentAddress.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === "all" || complaint.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || complaint.priority === selectedPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Mettre à jour le statut d'une plainte
  const handleStatusUpdate = async (complaintId: string, newStatus: Complaint['status']) => {
    try {
      await apiService.updateComplaintStatus(complaintId, newStatus)
      toast({
        title: "Succès",
        description: "Statut de la plainte mis à jour",
        variant: "default"
      })
      loadData()
    } catch (error) {
      handleApiError(error, "Mise à jour du statut", true)
    }
  }

  // Ajouter un service
  const handleAddService = async () => {
    if (!selectedComplaint) return

    try {
      const response = await fetch('/api/ngo/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          serviceType: newService.serviceType,
          notes: newService.notes
        })
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Service ajouté avec succès",
          variant: "default"
        })
        setIsServiceDialogOpen(false)
        setNewService({ serviceType: 'MEDICAL', notes: '' })
        loadData()
      } else {
        throw new Error('Erreur d\'ajout')
      }
    } catch (error) {
      handleApiError(error, "Ajout du service", true)
    }
  }

  // Mettre à jour le statut d'un service
  const handleServiceStatusUpdate = async (serviceId: string, newStatus: Service['status']) => {
    try {
      const response = await fetch(`/api/ngo/services/${serviceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Statut du service mis à jour",
          variant: "default"
        })
        loadData()
      } else {
        throw new Error('Erreur de mise à jour')
      }
    } catch (error) {
      handleApiError(error, "Mise à jour du service", true)
    }
  }

  const getStatusIcon = (status: Complaint['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'IN_PROGRESS':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CLOSED':
        return <CheckSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Complaint['status']) => {
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

  const getPriorityBadge = (priority: Complaint['priority']) => {
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

  const getServiceStatusBadge = (status: Service['status']) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge variant="secondary">Demandé</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-500">En cours</Badge>
      case 'PROVIDED':
        return <Badge variant="default" className="bg-green-500">Fourni</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejeté</Badge>
      case 'CLOSED':
        return <Badge variant="outline">Fermé</Badge>
    }
  }

  const getServiceTypeLabel = (type: Service['serviceType']) => {
    switch (type) {
      case 'MEDICAL':
        return 'Médical'
      case 'PSYCHOLOGICAL':
        return 'Psychologique'
      case 'LEGAL':
        return 'Juridique'
      case 'PROTECTION':
        return 'Protection'
      case 'SHELTER':
        return 'Hébergement'
      case 'SOCIO_ECONOMIC':
        return 'Socio-économique'
      case 'OTHER':
        return 'Autre'
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
                <Building className="h-8 w-8" />
                Tableau de bord ONG
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestion des plaintes et services d'accompagnement
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total plaintes</p>
                    <p className="text-2xl font-bold text-primary">{stats.totalComplaints}</p>
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
                    <p className="text-2xl font-bold text-yellow-500">{stats.pendingComplaints}</p>
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
                    <p className="text-2xl font-bold text-blue-500">{stats.inProgressComplaints}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                    <p className="text-2xl font-bold text-red-500">{stats.urgentComplaints}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Onglets principaux */}
          <Tabs defaultValue="complaints" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="complaints">Plaintes</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            {/* Onglet Plaintes */}
            <TabsContent value="complaints" className="space-y-6">
              {/* Filtres */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Rechercher par code, nom, type d'incident..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                        <SelectItem value="COMPLETED">Terminé</SelectItem>
                        <SelectItem value="CLOSED">Fermé</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Toutes les priorités" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les priorités</SelectItem>
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyen</SelectItem>
                        <SelectItem value="HIGH">Élevé</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tableau des plaintes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Plaintes ({filteredComplaints.length})
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
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredComplaints.map((complaint) => (
                            <TableRow key={complaint.id}>
                              <TableCell className="font-mono text-sm">
                                {complaint.trackingCode}
                              </TableCell>
                              
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {complaint.beneficiaryName || "Anonyme"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {complaint.beneficiarySex === 'FEMALE' ? 'F' : 'M'}, {complaint.beneficiaryAge} ans
                                  </div>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className="text-sm">{complaint.incidentType}</div>
                                {complaint.type === 'INVESTIGATOR_ASSISTED' && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Via enquêteur
                                  </Badge>
                                )}
                              </TableCell>
                              
                              <TableCell>
                                {getPriorityBadge(complaint.priority)}
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(complaint.status)}
                                  {getStatusBadge(complaint.status)}
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  {complaint.geolocationProvince} - {complaint.geolocationTerritory}
                                </div>
                                {complaint.geolocationVillage && (
                                  <div className="text-xs text-muted-foreground">
                                    {complaint.geolocationVillage}
                                  </div>
                                )}
                              </TableCell>
                              
                              <TableCell>
                                <div className="text-sm">
                                  {new Date(complaint.incidentDate).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(complaint.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedComplaint(complaint)
                                      setIsDetailsDialogOpen(true)
                                    }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Voir les détails
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedComplaint(complaint)
                                      setIsServiceDialogOpen(true)
                                    }}>
                                      <Send className="h-4 w-4 mr-2" />
                                      Ajouter un service
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}>
                                      <Activity className="h-4 w-4 mr-2" />
                                      Marquer en cours
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(complaint.id, 'COMPLETED')}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Marquer terminé
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Services */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Services d'accompagnement ({services.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plainte</TableHead>
                          <TableHead>Type de service</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((service) => {
                          const complaint = complaints.find(c => c.id === service.complaintId)
                          return (
                            <TableRow key={service.id}>
                              <TableCell>
                                <div className="font-mono text-sm">
                                  {complaint?.trackingCode}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {complaint?.beneficiaryName || "Anonyme"}
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                {getServiceTypeLabel(service.serviceType)}
                              </TableCell>
                              
                              <TableCell>
                                {getServiceStatusBadge(service.status)}
                              </TableCell>
                              
                              <TableCell>
                                <div className="text-sm max-w-xs truncate">
                                  {service.notes || "-"}
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className="text-sm">
                                  {new Date(service.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleServiceStatusUpdate(service.id, 'IN_PROGRESS')}>
                                      <Activity className="h-4 w-4 mr-2" />
                                      Marquer en cours
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleServiceStatusUpdate(service.id, 'PROVIDED')}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Marquer fourni
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleServiceStatusUpdate(service.id, 'CLOSED')}>
                                      <CheckSquare className="h-4 w-4 mr-2" />
                                      Fermer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dialog détails de la plainte */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Détails de la plainte</DialogTitle>
                <DialogDescription>
                  Informations complètes sur la plainte sélectionnée
                </DialogDescription>
              </DialogHeader>
              
              {selectedComplaint && (
                <div className="space-y-6">
                  {/* Informations générales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Informations générales</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Code de suivi:</span>
                          <span className="font-mono text-sm">{selectedComplaint.trackingCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <Badge variant="outline">
                            {selectedComplaint.type === 'VICTIM_DIRECT' ? 'Victime directe' : 'Via enquêteur'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Statut:</span>
                          {getStatusBadge(selectedComplaint.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Priorité:</span>
                          {getPriorityBadge(selectedComplaint.priority)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Bénéficiaire</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Nom:</span>
                          <span className="text-sm">{selectedComplaint.beneficiaryName || "Anonyme"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Sexe:</span>
                          <span className="text-sm">{selectedComplaint.beneficiarySex === 'FEMALE' ? 'Féminin' : 'Masculin'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Âge:</span>
                          <span className="text-sm">{selectedComplaint.beneficiaryAge} ans</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Incident */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Incident</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="text-sm">{selectedComplaint.incidentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="text-sm">{new Date(selectedComplaint.incidentDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Lieu:</span>
                        <span className="text-sm">{selectedComplaint.incidentAddress}</span>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">Description:</span>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg">
                          {selectedComplaint.incidentDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enquêteur */}
                  {selectedComplaint.investigator && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Enquêteur</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Nom:</span>
                          <span className="text-sm">{selectedComplaint.investigator.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Badge:</span>
                          <span className="text-sm font-mono">{selectedComplaint.investigator.badgeNumber}</span>
                        </div>
                        {selectedComplaint.investigatorComment && (
                          <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Commentaire:</span>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg">
                              {selectedComplaint.investigatorComment}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preuves */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preuves collectées</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedComplaint.evidence.map((evidence, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{evidence.fileName}</div>
                              <div className="text-xs text-muted-foreground">
                                {evidence.type} • {(evidence.fileSize / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Services d'accompagnement</h3>
                    <div className="space-y-2">
                      {selectedComplaint.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium text-sm">{getServiceTypeLabel(service.serviceType as Service['serviceType'])}</div>
                            {service.notes && (
                              <div className="text-xs text-muted-foreground">{service.notes}</div>
                            )}
                          </div>
                          {getServiceStatusBadge(service.status as Service['status'])}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Dialog ajouter un service */}
          <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un service d'accompagnement</DialogTitle>
                <DialogDescription>
                  Proposer un service d'accompagnement pour cette plainte
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Type de service</Label>
                  <Select
                    value={newService.serviceType}
                    onValueChange={(value) => setNewService(prev => ({ ...prev, serviceType: value as Service['serviceType'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEDICAL">Médical</SelectItem>
                      <SelectItem value="PSYCHOLOGICAL">Psychologique</SelectItem>
                      <SelectItem value="LEGAL">Juridique</SelectItem>
                      <SelectItem value="PROTECTION">Protection</SelectItem>
                      <SelectItem value="SHELTER">Hébergement</SelectItem>
                      <SelectItem value="SOCIO_ECONOMIC">Socio-économique</SelectItem>
                      <SelectItem value="OTHER">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Input
                    id="notes"
                    value={newService.notes}
                    onChange={(e) => setNewService(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Détails sur le service proposé..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddService}>
                  Ajouter le service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
