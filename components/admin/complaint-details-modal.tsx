"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { FileVideo, FileAudio, FileImage, FileText, Download, Play } from "lucide-react"
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
  source?: "public" | "investigator"
  contactPreference?: "anonymous" | "contact"
  treatmentStatus?: "none" | "acknowledged" | "transmitted" | "decision"
  treatmentDetails?: string
  transmittedTo?: string
  evidence?: Array<{
    type: "video" | "audio" | "image" | "document"
    fileName: string
    fileSize: number
    url?: string
  }>
}

type ComplaintDetailsModalProps = {
  complaint: Case
  onClose: () => void
  onTreatment?: () => void
}

export function ComplaintDetailsModal({ complaint, onClose, onTreatment }: ComplaintDetailsModalProps) {
  const [status, setStatus] = useState(complaint.status)
  const [fullDetails, setFullDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Charger les détails complets depuis l'API
  useEffect(() => {
    const loadFullDetails = async () => {
      setIsLoading(true)
      try {
        const details = await apiService.getComplaintById(complaint.id)
        setFullDetails(details)
      } catch (error) {
        logger.error('Erreur lors du chargement des détails', error, 'ComplaintDetailsModal')
      } finally {
        setIsLoading(false)
      }
    }
    loadFullDetails()
  }, [complaint.id])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <FileVideo className="h-5 w-5" />
      case "audio":
        return <FileAudio className="h-5 w-5" />
      case "image":
        return <FileImage className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du cas {complaint.code}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="evidence">
              Preuves {complaint.evidence && complaint.evidence.length > 0 && `(${complaint.evidence.length})`}
            </TabsTrigger>
            <TabsTrigger value="treatment">Traitement</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">Chargement des détails...</div>
            ) : (
              <>
                {/* Informations du bénéficiaire */}
                {fullDetails && (
                  <div className="space-y-4 border-b pb-4">
                    <h3 className="text-lg font-semibold">Informations du bénéficiaire</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Sexe</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiarySex || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Âge</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryAge || 'N/A'}</p>
                      </div>
                      {fullDetails.beneficiaryBirthDate && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                          <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryBirthDate}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Territoire</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryTerritory || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Groupement</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryGroupement || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Village</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryVillage || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Taille du ménage</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryHouseholdSize || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Adresse actuelle</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryCurrentAddress || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Statut</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryStatus || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nature des faits</p>
                        <p className="text-sm font-semibold mt-1">{fullDetails.beneficiaryNatureOfFacts || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informations de l'incident */}
                {fullDetails && (fullDetails.incidentType || fullDetails.incidentDate) && (
                  <div className="space-y-4 border-b pb-4">
                    <h3 className="text-lg font-semibold">Informations de l'incident</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {fullDetails.incidentType && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Type d'incident</p>
                          <p className="text-sm font-semibold mt-1">{fullDetails.incidentType}</p>
                        </div>
                      )}
                      {fullDetails.incidentDate && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Date de l'incident</p>
                          <p className="text-sm font-semibold mt-1">{fullDetails.incidentDate}</p>
                        </div>
                      )}
                      {fullDetails.incidentTime && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Heure de l'incident</p>
                          <p className="text-sm font-semibold mt-1">{fullDetails.incidentTime}</p>
                        </div>
                      )}
                      {fullDetails.incidentAddress && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Lieu de l'incident</p>
                          <p className="text-sm font-semibold mt-1">{fullDetails.incidentAddress}</p>
                        </div>
                      )}
                      {fullDetails.incidentDescription && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Description</p>
                          <div className="bg-secondary/50 rounded-lg p-4 mt-1">
                            <p className="text-sm">{fullDetails.incidentDescription}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type d'incident</p>
                    <p className="text-sm font-semibold mt-1">{complaint.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de dépôt</p>
                    <p className="text-sm font-semibold mt-1">{complaint.submittedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                    <p className="text-sm font-semibold mt-1">{complaint.location}</p>
                  </div>
                  {complaint.source && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Source</p>
                      <Badge className="mt-1">
                        {complaint.source === "public" ? "Signalé par le public" : "Soumis par enquêteur"}
                      </Badge>
                    </div>
                  )}
                  {complaint.contactPreference && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Préférence de contact</p>
                      <Badge className="mt-1">
                        {complaint.contactPreference === "anonymous" ? "Anonyme" : "Être contacté"}
                      </Badge>
                    </div>
                  )}
                  {fullDetails?.investigator && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Enquêteur</p>
                      <p className="text-sm font-semibold mt-1">{fullDetails.investigator.name || fullDetails.investigatorName || 'N/A'}</p>
                    </div>
                  )}
                  {fullDetails?.investigatorComment && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Commentaire de l'enquêteur</p>
                      <div className="bg-secondary/50 rounded-lg p-4 mt-1">
                        <p className="text-sm">{fullDetails.investigatorComment}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Status Management */}
            <div className="space-y-4 border-t border-border pt-4">
              <div className="space-y-2">
                <Label htmlFor="status">Changer le statut</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reçue">Reçue</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Transmise">Transmise</SelectItem>
                    <SelectItem value="Clôturée">Clôturée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            {(fullDetails?.evidence || complaint.evidence) && (fullDetails?.evidence || complaint.evidence)!.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(fullDetails?.evidence || complaint.evidence)!.map((evidence: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getEvidenceIcon(evidence.type)}
                        <span className="font-medium text-sm">{evidence.fileName}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(evidence.fileSize)} • {evidence.type === "video" ? "Vidéo" : 
                       evidence.type === "audio" ? "Audio" : 
                       evidence.type === "image" ? "Image" : "Document"}
                    </p>
                    {evidence.type === "video" && (
                      <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                        <Button variant="ghost" size="sm">
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                    {evidence.type === "audio" && (
                      <div className="bg-secondary rounded-lg p-4 flex items-center justify-center">
                        <Button variant="ghost" size="sm">
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                    {evidence.type === "image" && (
                      <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                        <FileImage className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune preuve disponible pour ce dossier</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="treatment" className="space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Statut de traitement</p>
                {complaint.treatmentStatus ? (
                  <div className="space-y-2">
                    {complaint.treatmentStatus === "acknowledged" && (
                      <Badge className="bg-blue-500 text-white">Accusé de réception</Badge>
                    )}
                    {complaint.treatmentStatus === "transmitted" && (
                      <div className="space-y-2">
                        <Badge className="bg-purple-500 text-white">Dossier transmis</Badge>
                        {complaint.transmittedTo && (
                          <p className="text-sm">
                            <span className="font-medium">Transmis à :</span> {complaint.transmittedTo}
                          </p>
                        )}
                      </div>
                    )}
                    {complaint.treatmentStatus === "decision" && (
                      <div className="space-y-2">
                        <Badge className="bg-green-500 text-white">Décision prise</Badge>
                        {complaint.treatmentDetails && (
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-sm">{complaint.treatmentDetails}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline">Non traité</Badge>
                )}
              </div>
              
              {onTreatment && (
                <Button onClick={onTreatment} className="w-full">
                  Traiter ce dossier
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button className="flex-1">Sauvegarder les modifications</Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
