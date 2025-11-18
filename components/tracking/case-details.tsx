import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, FileText, MessageSquare } from "lucide-react"

type CaseDetailsProps = {
  data: {
    code: string
    status: string
    incidentType: string
    date: string
    location: string
    submittedDate: string
    lastUpdate: string
    assignedServices: string[]
    notes: string
  }
}

export function CaseDetails({ data }: CaseDetailsProps) {
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

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Dossier {data.code}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Dernière mise à jour : {data.lastUpdate}</p>
          </div>
          <Badge className={`${getStatusColor(data.status)} text-white`}>{data.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Type d'incident</p>
                <p className="text-sm text-muted-foreground">{data.incidentType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date de l'incident</p>
                <p className="text-sm text-muted-foreground">{data.date}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Lieu</p>
                <p className="text-sm text-muted-foreground">{data.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date de dépôt</p>
                <p className="text-sm text-muted-foreground">{data.submittedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {data.assignedServices.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium mb-2">Services assignés</p>
            <div className="flex flex-wrap gap-2">
              {data.assignedServices.map((service, index) => (
                <Badge key={index} variant="outline">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.notes && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300">{data.notes}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button className="flex-1 gap-2">
            <MessageSquare className="h-4 w-4" />
            Contacter un agent
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
