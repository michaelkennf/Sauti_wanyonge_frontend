"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState } from "react"

type Complaint = {
  id: string
  code: string
  type: string
  date: string
  location: string
  status: string
  urgency: "low" | "medium" | "high"
  submittedDate: string
}

type ComplaintDetailsModalProps = {
  complaint: Complaint
  onClose: () => void
}

export function ComplaintDetailsModal({ complaint, onClose }: ComplaintDetailsModalProps) {
  const [status, setStatus] = useState(complaint.status)
  const [notes, setNotes] = useState("")

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la plainte {complaint.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type d'incident</p>
              <p className="text-sm font-semibold mt-1">{complaint.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de l'incident</p>
              <p className="text-sm font-semibold mt-1">{complaint.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Localisation</p>
              <p className="text-sm font-semibold mt-1">{complaint.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de dépôt</p>
              <p className="text-sm font-semibold mt-1">{complaint.submittedDate}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
          </div>

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

            <div className="space-y-2">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                placeholder="Ajouter des notes sur le traitement de ce dossier..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1">Sauvegarder les modifications</Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
