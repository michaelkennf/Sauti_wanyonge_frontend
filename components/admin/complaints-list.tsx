"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Download, FileVideo, FileAudio, FileImage, CheckCircle, Send, Gavel, FileText, Table } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ComplaintDetailsModal } from "./complaint-details-modal"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"
import { logger } from "@/lib/logger"

type Case = {
  id: string
  code: string
  type: string
  date: string
  location: string
  status: string
  urgency: "low" | "medium" | "high"
  submittedDate: string
  source: "public" | "investigator" // Nouveau : source du cas
  contactPreference?: "anonymous" | "contact" // Nouveau : préférence de contact
  treatmentStatus?: "none" | "acknowledged" | "transmitted" | "decision" // Nouveau : statut de traitement
  treatmentDetails?: string // Nouveau : détails du traitement
  transmittedTo?: string // Nouveau : institution à laquelle le dossier a été transmis
  evidence?: Array<{ // Nouveau : preuves
    type: "video" | "audio" | "image" | "document"
    fileName: string
    fileSize: number
    url?: string
  }>
}

// Types de violences depuis la page d'accueil
const violenceTypes = [
  "Viol",
  "Harcèlement sexuel",
  "Zoophilie",
  "Mariage forcé",
  "Proxénétisme",
  "Attentat à la pudeur",
  "Autres crimes graves"
]

// TODO: Remplacer par des appels API réels via apiService.getComplaints()
// Ces données mock sont temporaires et doivent être supprimées une fois l'API intégrée
const mockPublicCases: Case[] = [
  {
    id: "1",
    code: "ABC-123-XYZ",
    type: "Viol",
    date: "2024-01-15",
    location: "Kinshasa, Ngaliema",
    status: "En cours",
    urgency: "high",
    submittedDate: "2024-01-16",
    source: "public",
    contactPreference: "anonymous",
    treatmentStatus: "acknowledged",
    evidence: [
      { type: "video", fileName: "video_evidence.webm", fileSize: 5242880 },
      { type: "audio", fileName: "audio_evidence.webm", fileSize: 1048576 }
    ]
  },
  {
    id: "2",
    code: "DEF-456-UVW",
    type: "Harcèlement sexuel",
    date: "2024-01-18",
    location: "Lubumbashi, Centre",
    status: "Transmise",
    urgency: "medium",
    submittedDate: "2024-01-18",
    source: "public",
    contactPreference: "contact",
    treatmentStatus: "transmitted",
    transmittedTo: "Ministère de la Justice",
    evidence: [
      { type: "image", fileName: "photo_evidence.jpg", fileSize: 2048576 }
    ]
  },
]

// TODO: Remplacer par des appels API réels via apiService.getComplaints({ type: 'investigator' })
// Ces données mock sont temporaires et doivent être supprimées une fois l'API intégrée
const mockInvestigatorCases: Case[] = [
  {
    id: "3",
    code: "INV-789-RST",
    type: "Viol",
    date: "2024-01-20",
    location: "Goma, Karisimbi",
    status: "Reçue",
    urgency: "high",
    submittedDate: "2024-01-20",
    source: "investigator",
    treatmentStatus: "decision",
    treatmentDetails: "Décision prise : dossier classé et transmis aux autorités compétentes",
    evidence: [
      { type: "video", fileName: "investigator_video.webm", fileSize: 10485760 },
      { type: "audio", fileName: "investigator_audio.webm", fileSize: 2097152 },
      { type: "image", fileName: "beneficiary_photo.jpg", fileSize: 1024000 }
    ]
  },
  {
    id: "4",
    code: "INV-012-OPQ",
    type: "Mariage forcé",
    date: "2024-01-12",
    location: "Kisangani, Makiso",
    status: "Clôturée",
    urgency: "low",
    submittedDate: "2024-01-13",
    source: "investigator",
    treatmentStatus: "decision",
    evidence: []
  },
]

export function ComplaintsList() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [contactFilter, setContactFilter] = useState("all") // Nouveau : filtre par préférence de contact
  const [violenceTypeFilter, setViolenceTypeFilter] = useState("all") // Nouveau : filtre par type de violence
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false)
  const [treatmentType, setTreatmentType] = useState<"acknowledged" | "transmitted" | "decision">("acknowledged")
  const [treatmentDetails, setTreatmentDetails] = useState("")
  const [transmittedTo, setTransmittedTo] = useState("")
  const [activeTab, setActiveTab] = useState<"public" | "investigator">("public")
  const [isLoading, setIsLoading] = useState(false)

  const [publicCases, setPublicCases] = useState<Case[]>([])
  const [investigatorCases, setInvestigatorCases] = useState<Case[]>([])

  // Charger les cas depuis l'API
  useEffect(() => {
    loadCases()
  }, [activeTab])

  const loadCases = async () => {
    setIsLoading(true)
    try {
      // TODO: Adapter selon les filtres réels de l'API
      const params: any = {
        page: 1,
        limit: 100,
      }

      if (activeTab === "public") {
        params.type = "VICTIM_DIRECT"
      } else {
        params.type = "INVESTIGATOR_ASSISTED"
      }

      const response = await apiService.getComplaints(params)
      
      // Transformer les données de l'API vers le format Case
      const transformedCases: Case[] = response.data.map((complaint: any) => ({
        id: complaint.id,
        code: complaint.trackingCode || complaint.id,
        type: complaint.beneficiaryData?.natureOfFacts || "Non spécifié",
        date: complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "",
        location: complaint.geolocation?.address || complaint.geolocation?.village || "Non spécifié",
        status: mapStatus(complaint.status),
        urgency: mapPriority(complaint.priority),
        submittedDate: complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "",
        source: activeTab === "public" ? "public" : "investigator",
        contactPreference: complaint.type === "VICTIM_DIRECT" ? "anonymous" : undefined,
        treatmentStatus: mapTreatmentStatus(complaint.treatmentStatus),
        treatmentDetails: complaint.treatmentDetails,
        transmittedTo: complaint.transmittedTo,
        evidence: complaint.evidence?.map((ev: any) => ({
          type: mapEvidenceType(ev.type),
          fileName: ev.fileName,
          fileSize: ev.fileSize || 0,
          url: ev.url,
        })) || [],
      }))

      if (activeTab === "public") {
        setPublicCases(transformedCases)
      } else {
        setInvestigatorCases(transformedCases)
      }
    } catch (error) {
      logger.error('Erreur lors du chargement des cas', error, 'ComplaintsList')
      toast({
        title: "Erreur",
        description: "Impossible de charger les cas. Utilisation des données de démonstration.",
        variant: "destructive"
      })
      // Fallback vers les données mock en cas d'erreur
      if (activeTab === "public") {
        setPublicCases(mockPublicCases)
      } else {
        setInvestigatorCases(mockInvestigatorCases)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fonctions de mapping
  const mapStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': 'En cours',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Clôturée',
      'CLOSED': 'Clôturée',
      'RECEIVED': 'Reçue',
      'TRANSMITTED': 'Transmise',
    }
    return statusMap[status] || status
  }

  const mapPriority = (priority: string): "low" | "medium" | "high" => {
    const priorityMap: Record<string, "low" | "medium" | "high"> = {
      'LOW': 'low',
      'MEDIUM': 'medium',
      'HIGH': 'high',
      'URGENT': 'high',
    }
    return priorityMap[priority] || 'medium'
  }

  const mapTreatmentStatus = (status?: string): "acknowledged" | "transmitted" | "decision" | undefined => {
    if (!status) return undefined
    const statusMap: Record<string, "acknowledged" | "transmitted" | "decision"> = {
      'ACKNOWLEDGED': 'acknowledged',
      'TRANSMITTED': 'transmitted',
      'DECISION': 'decision',
    }
    return statusMap[status]
  }

  const mapEvidenceType = (type: string): "video" | "audio" | "image" | "document" => {
    const typeMap: Record<string, "video" | "audio" | "image" | "document"> = {
      'VIDEO': 'video',
      'AUDIO': 'audio',
      'PHOTO': 'image',
      'IDENTITY_DOCUMENT': 'document',
      'INVESTIGATOR_SUMMARY': 'document',
    }
    return typeMap[type] || 'document'
  }

  const currentCases = activeTab === "public" ? publicCases : investigatorCases

  const filteredCases = currentCases.filter((caseItem) => {
    const matchesSearch =
      searchQuery === "" ||
      caseItem.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter
    const matchesContact = contactFilter === "all" || 
      (activeTab === "public" && caseItem.contactPreference === contactFilter)
    const matchesViolenceType = violenceTypeFilter === "all" || caseItem.type === violenceTypeFilter
    return matchesSearch && matchesStatus && matchesContact && matchesViolenceType
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "reçue":
        return "bg-blue-500"
      case "en cours":
        return "bg-yellow-500"
      case "transmise":
        return "bg-purple-500"
      case "clôturée":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTreatmentStatusBadge = (status?: string) => {
    switch (status) {
      case "acknowledged":
        return <Badge className="bg-blue-500 text-white">Accusé de réception</Badge>
      case "transmitted":
        return <Badge className="bg-purple-500 text-white">Dossier transmis</Badge>
      case "decision":
        return <Badge className="bg-green-500 text-white">Décision prise</Badge>
      default:
        return <Badge variant="outline">Non traité</Badge>
    }
  }

  const handleTreatment = async () => {
    if (!selectedCase) return

    if (treatmentType === "transmitted" && !transmittedTo.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez indiquer l'institution à laquelle le dossier est transmis",
        variant: "destructive"
      })
      return
    }

    if (treatmentType === "decision" && !treatmentDetails.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez indiquer la décision prise",
        variant: "destructive"
      })
      return
    }

    try {
      // Mettre à jour via l'API avec la nouvelle méthode de traitement
      await apiService.updateComplaintTreatment(selectedCase.id, {
        treatmentStatus: treatmentType,
        treatmentDetails: treatmentType === "decision" ? treatmentDetails : undefined,
        transmittedTo: treatmentType === "transmitted" ? transmittedTo : undefined
      })

      // Mettre à jour le cas localement
      const updatedCase: Case = {
        ...selectedCase,
        treatmentStatus: treatmentType,
        treatmentDetails: treatmentType === "decision" ? treatmentDetails : selectedCase.treatmentDetails,
        transmittedTo: treatmentType === "transmitted" ? transmittedTo : selectedCase.transmittedTo
      }

      // Mettre à jour la liste appropriée
      if (selectedCase.source === "public") {
        setPublicCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c))
      } else {
        setInvestigatorCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c))
      }

      toast({
        title: "Traitement enregistré",
        description: `Le dossier ${selectedCase.code} a été traité avec succès. L'utilisateur pourra voir ce statut en consultant son code de suivi.`,
      })

      setTreatmentDialogOpen(false)
      setSelectedCase(null)
      setTreatmentDetails("")
      setTransmittedTo("")
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du traitement', error, 'ComplaintsList')
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le traitement. Veuillez réessayer.",
        variant: "destructive"
      })
    }
  }

  const handleDownload = (caseItem: Case) => {
    toast({
      title: "Téléchargement",
      description: `Téléchargement du dossier ${caseItem.code}...`,
    })
    // Implémenter le téléchargement réel
  }

  const handleExportPDF = async () => {
    try {
      setIsLoading(true)
      const filters: any = {}
      
      if (statusFilter !== "all") {
        filters.status = statusFilter.toUpperCase()
      }
      
      if (violenceTypeFilter !== "all") {
        filters.violenceType = violenceTypeFilter
      }
      
      if (contactFilter !== "all") {
        filters.contactPreference = contactFilter === "anonymous" ? "ANONYMOUS" : "TO_BE_CONTACTED"
      }
      
      if (activeTab === "investigator") {
        filters.complaintType = "INVESTIGATOR_ASSISTED"
      } else {
        filters.complaintType = "VICTIM_DIRECT"
      }

      const blob = await apiService.exportComplaintsPDF(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-cas-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export réussi",
        description: "Le rapport PDF a été téléchargé avec succès.",
      })
    } catch (error: any) {
      logger.error('Erreur lors de l\'export PDF', error, 'ComplaintsList')
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'exporter le rapport PDF. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setIsLoading(true)
      const filters: any = {}
      
      if (statusFilter !== "all") {
        filters.status = statusFilter.toUpperCase()
      }
      
      if (violenceTypeFilter !== "all") {
        filters.violenceType = violenceTypeFilter
      }
      
      if (contactFilter !== "all") {
        filters.contactPreference = contactFilter === "anonymous" ? "ANONYMOUS" : "TO_BE_CONTACTED"
      }
      
      if (activeTab === "investigator") {
        filters.complaintType = "INVESTIGATOR_ASSISTED"
      } else {
        filters.complaintType = "VICTIM_DIRECT"
      }

      const blob = await apiService.exportComplaintsExcel(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-cas-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export réussi",
        description: "Le rapport Excel a été téléchargé avec succès.",
      })
    } catch (error: any) {
      logger.error('Erreur lors de l\'export Excel', error, 'ComplaintsList')
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'exporter le rapport Excel. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des cas</h1>
          <p className="text-muted-foreground">Liste et suivi de tous les cas signalés</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2" disabled={isLoading}>
              <Download className="h-4 w-4" />
              {isLoading ? "Export en cours..." : "Exporter"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Exporter en PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
              <Table className="h-4 w-4 mr-2" />
              Exporter en Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs pour les deux types de stockages */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "public" | "investigator")}>
        <TabsList>
          <TabsTrigger value="public">Cas signalés par le public</TabsTrigger>
          <TabsTrigger value="investigator">Cas soumis par les enquêteurs</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-6">
          {/* Filters */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par code, type ou localisation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="Reçue">Reçue</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Transmise">Transmise</SelectItem>
                    <SelectItem value="Clôturée">Clôturée</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={contactFilter} onValueChange={setContactFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Préférence contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="anonymous">Anonyme</SelectItem>
                    <SelectItem value="contact">Être contacté</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={violenceTypeFilter} onValueChange={setViolenceTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type de violence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {violenceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cases Table */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Cas signalés par le public ({filteredCases.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold text-sm">Code</th>
                      <th className="text-left p-4 font-semibold text-sm">Type</th>
                      <th className="text-left p-4 font-semibold text-sm">Date</th>
                      <th className="text-left p-4 font-semibold text-sm">Localisation</th>
                      <th className="text-left p-4 font-semibold text-sm">Statut</th>
                      <th className="text-left p-4 font-semibold text-sm">Traitement</th>
                      <th className="text-left p-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((caseItem) => (
                      <tr key={caseItem.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-sm">{caseItem.code}</span>
                        </td>
                        <td className="p-4 text-sm">{caseItem.type}</td>
                        <td className="p-4 text-sm">{caseItem.date}</td>
                        <td className="p-4 text-sm">{caseItem.location}</td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(caseItem.status)} text-white`}>{caseItem.status}</Badge>
                        </td>
                        <td className="p-4">
                          {getTreatmentStatusBadge(caseItem.treatmentStatus)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => setSelectedCase(caseItem)}
                            >
                              <Eye className="h-4 w-4" />
                              Voir
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleDownload(caseItem)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                setSelectedCase(caseItem)
                                setTreatmentDialogOpen(true)
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Traiter
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investigator" className="space-y-6">
          {/* Filters pour les cas des enquêteurs */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par code, type ou localisation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="Reçue">Reçue</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Transmise">Transmise</SelectItem>
                    <SelectItem value="Clôturée">Clôturée</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={violenceTypeFilter} onValueChange={setViolenceTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type de violence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {violenceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cases Table */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Cas soumis par les enquêteurs ({filteredCases.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold text-sm">Code</th>
                      <th className="text-left p-4 font-semibold text-sm">Type</th>
                      <th className="text-left p-4 font-semibold text-sm">Date</th>
                      <th className="text-left p-4 font-semibold text-sm">Localisation</th>
                      <th className="text-left p-4 font-semibold text-sm">Statut</th>
                      <th className="text-left p-4 font-semibold text-sm">Traitement</th>
                      <th className="text-left p-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((caseItem) => (
                      <tr key={caseItem.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-sm">{caseItem.code}</span>
                        </td>
                        <td className="p-4 text-sm">{caseItem.type}</td>
                        <td className="p-4 text-sm">{caseItem.date}</td>
                        <td className="p-4 text-sm">{caseItem.location}</td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(caseItem.status)} text-white`}>{caseItem.status}</Badge>
                        </td>
                        <td className="p-4">
                          {getTreatmentStatusBadge(caseItem.treatmentStatus)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => setSelectedCase(caseItem)}
                            >
                              <Eye className="h-4 w-4" />
                              Voir
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleDownload(caseItem)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                setSelectedCase(caseItem)
                                setTreatmentDialogOpen(true)
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Traiter
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Case Details Modal */}
      {selectedCase && !treatmentDialogOpen && (
        <ComplaintDetailsModal 
          complaint={selectedCase} 
          onClose={() => setSelectedCase(null)}
          onTreatment={() => {
            setTreatmentDialogOpen(true)
          }}
        />
      )}

      {/* Treatment Dialog */}
      <Dialog open={treatmentDialogOpen} onOpenChange={(open) => {
        setTreatmentDialogOpen(open)
        if (!open) {
          setSelectedCase(null)
          setTreatmentDetails("")
          setTransmittedTo("")
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Traiter le dossier {selectedCase?.code || "sélectionné"}</DialogTitle>
            <DialogDescription>
              Choisissez le type de traitement pour ce dossier
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="treatmentType">Type de traitement *</Label>
              <Select value={treatmentType} onValueChange={(value: any) => setTreatmentType(value)}>
                <SelectTrigger id="treatmentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acknowledged">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Accusé de réception
                    </div>
                  </SelectItem>
                  <SelectItem value="transmitted">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Dossier transmis à une institution
                    </div>
                  </SelectItem>
                  <SelectItem value="decision">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      Décision prise
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {treatmentType === "transmitted" && (
              <div className="space-y-2">
                <Label htmlFor="transmittedTo">Institution *</Label>
                <Input
                  id="transmittedTo"
                  placeholder="Ex: Ministère de la Justice, Police Nationale, etc."
                  value={transmittedTo}
                  onChange={(e) => setTransmittedTo(e.target.value)}
                />
              </div>
            )}

            {treatmentType === "decision" && (
              <div className="space-y-2">
                <Label htmlFor="treatmentDetails">Décision prise *</Label>
                <Textarea
                  id="treatmentDetails"
                  placeholder="Décrivez la décision prise concernant ce dossier..."
                  value={treatmentDetails}
                  onChange={(e) => setTreatmentDetails(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTreatmentDialogOpen(false)
              setTreatmentDetails("")
              setTransmittedTo("")
            }}>
              Annuler
            </Button>
            <Button onClick={handleTreatment}>
              Enregistrer le traitement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
