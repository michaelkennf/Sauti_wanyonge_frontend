"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Edit, RefreshCw, RotateCcw, TrendingUp } from "lucide-react"

interface ViolenceStat {
  id: string
  violenceType: string
  count: number
  lastUpdated: string
  updatedBy: string | null
}

const VIOLENCE_TYPES = [
  'Viol',
  'Harcèlement sexuel',
  'Zoophilie',
  'Mariage forcé',
  'Proxénétisme',
  'Attentat à la pudeur',
  'Crimes contre la paix et la sécurité de l'humanité'
]

export function ViolenceStatsManagement() {
  const { toast } = useToast()
  const [stats, setStats] = useState<ViolenceStat[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStat, setEditingStat] = useState<ViolenceStat | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await apiService.getViolenceStats()
      setStats(data)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les statistiques",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (stat: ViolenceStat) => {
    setEditingStat(stat)
    setEditValue(stat.count.toString())
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingStat) return

    try {
      const newCount = parseInt(editValue)
      if (isNaN(newCount) || newCount < 0) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer un nombre valide",
          variant: "destructive"
        })
        return
      }

      await apiService.updateViolenceStats(editingStat.violenceType, newCount)
      toast({
        title: "Succès",
        description: "Statistique mise à jour avec succès",
      })
      setIsDialogOpen(false)
      setEditingStat(null)
      loadStats()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la statistique",
        variant: "destructive"
      })
    }
  }

  const handleReset = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ? Cette action est irréversible.")) {
      return
    }

    try {
      await apiService.resetViolenceStats()
      toast({
        title: "Succès",
        description: "Toutes les statistiques ont été réinitialisées",
      })
      loadStats()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser les statistiques",
        variant: "destructive"
      })
    }
  }

  // S'assurer que tous les types ont une entrée
  const allStats = VIOLENCE_TYPES.map(type => {
    const existing = stats.find(s => s.violenceType === type)
    return existing || {
      id: '',
      violenceType: type,
      count: 0,
      lastUpdated: new Date().toISOString(),
      updatedBy: null
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des statistiques de violence</h1>
          <p className="text-muted-foreground">Gérez les compteurs de cas signalés par type de violence</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadStats} variant="outline" className="gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={handleReset} variant="destructive" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques par type de violence</CardTitle>
          <CardDescription>
            Les compteurs s'incrémentent automatiquement lors de chaque signalement. Vous pouvez également les modifier manuellement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des statistiques...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type de violence</TableHead>
                  <TableHead className="text-right">Nombre de cas</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allStats.map((stat) => (
                  <TableRow key={stat.violenceType}>
                    <TableCell className="font-medium">{stat.violenceType}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold">{stat.count.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {stat.lastUpdated
                        ? new Date(stat.lastUpdated).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Jamais'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(stat)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la statistique</DialogTitle>
            <DialogDescription>
              Modifiez le nombre de cas signalés pour "{editingStat?.violenceType}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="count">Nombre de cas</Label>
              <Input
                id="count"
                type="number"
                min="0"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

