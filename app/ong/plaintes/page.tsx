"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
  Sync
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface Complaint {
  id: string
  trackingCode: string
  type: 'anonymous' | 'identified' | 'investigator'
  status: 'pending' | 'in_progress' | 'completed' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  incidentType: string
  date: string
  location: string
  province: string
  zone: string
  description: string
  investigatorName?: string
  investigatorId?: string
  victimName?: string
  victimContact?: string
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  evidence: {
    audioFiles: number
    videoFiles: number
    imageFiles: number
    documentFiles: number
  }
  services: string[]
  investigatorComment?: string
}

export default function NGOComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isOnline, setIsOnline] = useState(true) // Valeur par défaut pour SSR

  // Données simulées pour les ONG
  const mockComplaints: Complaint[] = [
    {
      id: "COMP001",
      trackingCode: "SYW-2024-001",
      type: "anonymous",
      status: "pending",
      priority: "high",
      incidentType: "Viol",
      date: "2024-01-20",
      location: "Kinshasa, Commune de Limete",
      province: "Kinshasa",
      zone: "Kinshasa - Zone 1",
      description: "Signalement d'un cas de violence sexuelle dans le quartier...",
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20"),
      evidence: {
        audioFiles: 1,
        videoFiles: 0,
        imageFiles: 2,
        documentFiles: 1,
      },
      services: ["Soins médicaux", "Assistance psychologique", "Aide juridique"],
    },
    {
      id: "COMP002",
      trackingCode: "SYW-2024-002",
      type: "identified",
      status: "in_progress",
      priority: "medium",
      incidentType: "Harcèlement sexuel",
      date: "2024-01-19",
      location: "Kongo-Central, Matadi",
      province: "Kongo-Central",
      zone: "Kongo-Central - Zone 2",
      description: "Cas de harcèlement sexuel au travail signalé par une employée...",
      victimName: "Marie Kabila",
      victimContact: "+243 123 456 789",
      createdAt: new Date("2024-01-19"),
      updatedAt: new Date("2024-01-21"),
      assignedTo: "ONG-001",
      evidence: {
        audioFiles: 0,
        videoFiles: 1,
        imageFiles: 3,
        documentFiles: 2,
      },
      services: ["Assistance psychologique", "Aide juridique"],
    },
    {
      id: "COMP003",
      trackingCode: "SYW-2024-003",
      type: "investigator",
      status: "completed",
      priority: "urgent",
      incidentType: "Enlèvement",
      date: "2024-01-18",
      location: "Nord-Kivu, Goma",
      province: "Nord-Kivu",
      zone: "Nord-Kivu - Zone 3",
      description: "Enquête menée par un enquêteur autorisé sur un cas d'enlèvement...",
      investigatorName: "Jean Mputu",
      investigatorId: "INV-2024-002",
      createdAt: new Date("2024-01-18"),
      updatedAt: new Date("2024-01-22"),
      assignedTo: "ONG-002",
      evidence: {
        audioFiles: 2,
        videoFiles: 1,
        imageFiles: 5,
        documentFiles: 3,
      },
      services: ["Protection immédiate", "Hébergement d'urgence", "Aide juridique"],
      investigatorComment: "Enquête complète menée avec succès. Victime en sécurité.",
    },
  ]

  useEffect(() => {
    loadComplaints()
    
    // Initialiser l'état de connexion (uniquement côté client)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
    }
    
    // Surveiller l'état de la connexion
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  const loadComplaints = async () => {
    setIsLoading(true)
    try {
      // Simulation de chargement des données
      setTimeout(() => {
        setComplaints(mockComplaints)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erreur lors du chargement des plaintes:', error)
      setIsLoading(false)
    }
  }

  const filteredComplaints = () => {
    let filtered = complaints

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(complaint => 
        complaint.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (complaint.victimName && complaint.victimName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.investigatorName && complaint.investigatorName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrage par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(complaint => complaint.status === filterStatus)
    }

    // Filtrage par type
    if (filterType !== "all") {
      filtered = filtered.filter(complaint => complaint.type === filterType)
    }

    return filtered
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'in_progress':
        return <Badge variant="default"><Loader2 className="h-3 w-3 mr-1 animate-spin" />En cours</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Terminé</Badge>
      case 'closed':
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Fermé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">Élevée</Badge>
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500">Moyenne</Badge>
      case 'low':
        return <Badge variant="outline">Faible</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'anonymous':
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Anonyme</Badge>
      case 'identified':
        return <Badge variant="outline"><User className="h-3 w-3 mr-1" />Identifié</Badge>
      case 'investigator':
        return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Enquêteur</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const exportComplaints = () => {
    const csvContent = [
      ['Code de suivi', 'Type', 'Statut', 'Priorité', 'Type d\'incident', 'Date', 'Lieu', 'Province', 'Zone', 'Créé le'],
      ...filteredComplaints().map(complaint => [
        complaint.trackingCode,
        complaint.type,
        complaint.status,
        complaint.priority,
        complaint.incidentType,
        complaint.date,
        complaint.location,
        complaint.province,
        complaint.zone,
        complaint.createdAt.toLocaleDateString('fr-FR')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plaintes-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Suivi des plaintes</h1>
              <p className="text-muted-foreground">
                Consultez et gérez les plaintes assignées à votre organisation.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    En ligne
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Hors ligne
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total des plaintes</p>
                  <p className="text-2xl font-bold">{complaints.length}</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {complaints.filter(c => c.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {complaints.filter(c => c.status === 'in_progress').length}
                  </p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">
                    {complaints.filter(c => c.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une plainte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="closed">Fermé</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">Tous les types</option>
              <option value="anonymous">Anonyme</option>
              <option value="identified">Identifié</option>
              <option value="investigator">Enquêteur</option>
            </select>
            <Button onClick={exportComplaints} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Tableau des plaintes */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Liste des plaintes</CardTitle>
            <CardDescription>
              {filteredComplaints().length} plainte(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code de suivi</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Incident</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints().map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>
                          <div className="font-mono text-sm font-medium">
                            {complaint.trackingCode}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(complaint.type)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{complaint.incidentType}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {complaint.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{complaint.date}</div>
                            <div className="text-muted-foreground">
                              {complaint.createdAt.toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3" />
                              {complaint.location}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {complaint.province} - {complaint.zone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(complaint.status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(complaint.priority)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedComplaint(complaint)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Download className="h-3 w-3" />
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

        {/* Dialog de détails */}
        {selectedComplaint && (
          <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Détails de la plainte</DialogTitle>
                <DialogDescription>
                  Code de suivi: {selectedComplaint.trackingCode}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{getTypeBadge(selectedComplaint.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Statut:</span>
                        <span>{getStatusBadge(selectedComplaint.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priorité:</span>
                        <span>{getPriorityBadge(selectedComplaint.priority)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type d'incident:</span>
                        <span className="font-medium">{selectedComplaint.incidentType}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Localisation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{selectedComplaint.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lieu:</span>
                        <span className="font-medium">{selectedComplaint.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Province:</span>
                        <span>{selectedComplaint.province}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zone:</span>
                        <span>{selectedComplaint.zone}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Informations sur la victime */}
                {selectedComplaint.type !== 'anonymous' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations sur la victime</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedComplaint.victimName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nom:</span>
                          <span className="font-medium">{selectedComplaint.victimName}</span>
                        </div>
                      )}
                      {selectedComplaint.victimContact && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact:</span>
                          <span>{selectedComplaint.victimContact}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Informations sur l'enquêteur */}
                {selectedComplaint.type === 'investigator' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enquêteur responsable</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nom:</span>
                        <span className="font-medium">{selectedComplaint.investigatorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-mono">{selectedComplaint.investigatorId}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description de l'incident</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{selectedComplaint.description}</p>
                  </CardContent>
                </Card>

                {/* Commentaire de l'enquêteur */}
                {selectedComplaint.investigatorComment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Commentaire de l'enquêteur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{selectedComplaint.investigatorComment}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Preuves */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preuves collectées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedComplaint.evidence.audioFiles}</div>
                        <div className="text-sm text-muted-foreground">Fichiers audio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedComplaint.evidence.videoFiles}</div>
                        <div className="text-sm text-muted-foreground">Fichiers vidéo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedComplaint.evidence.imageFiles}</div>
                        <div className="text-sm text-muted-foreground">Images</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedComplaint.evidence.documentFiles}</div>
                        <div className="text-sm text-muted-foreground">Documents</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Services requis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Services requis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedComplaint.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
