"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Navigation, Mail } from "lucide-react"

type Service = {
  id: number
  name: string
  type: string
  address: string
  phone: string
  email?: string
  hours: string
  description: string
}

const mockServices: Service[] = [
  {
    id: 1,
    name: "Hôpital Général de Kinshasa",
    type: "health",
    address: "Avenue de la Libération, Kinshasa",
    phone: "+243 XXX XXX XXX",
    email: "contact@hgk.cd",
    hours: "24h/24, 7j/7",
    description: "Services d'urgence et soins spécialisés pour victimes de violences. Équipe médicale formée.",
  },
  {
    id: 2,
    name: "Clinique Juridique de Kinshasa",
    type: "legal",
    address: "Boulevard du 30 Juin, Kinshasa",
    phone: "+243 XXX XXX XXX",
    email: "info@cjk.cd",
    hours: "Lun-Ven: 8h-17h",
    description: "Conseil juridique gratuit et accompagnement dans les procédures judiciaires.",
  },
  {
    id: 3,
    name: "Centre Médical Lisanga",
    type: "health",
    address: "Quartier Ngaliema, Kinshasa",
    phone: "+243 XXX XXX XXX",
    hours: "Lun-Sam: 7h-19h",
    description: "Consultations gratuites et confidentielles. Soutien psychologique disponible.",
  },
  {
    id: 4,
    name: "Association des Femmes Juristes",
    type: "ngo",
    address: "Commune de la Gombe, Kinshasa",
    phone: "+243 XXX XXX XXX",
    email: "contact@afj.cd",
    hours: "Lun-Ven: 9h-16h",
    description: "Assistance juridique spécialisée pour les victimes de VBG. Accompagnement personnalisé.",
  },
  {
    id: 5,
    name: "Centre de Soutien Psychosocial Tumaini",
    type: "health",
    address: "Avenue Kabambare, Kinshasa",
    phone: "+243 XXX XXX XXX",
    hours: "Lun-Ven: 8h-18h, Sam: 9h-13h",
    description: "Thérapie individuelle et groupes de parole. Soutien psychologique gratuit.",
  },
  {
    id: 6,
    name: "Commissariat Central de Kinshasa",
    type: "police",
    address: "Place de l'Indépendance, Kinshasa",
    phone: "+243 XXX XXX XXX",
    hours: "24h/24, 7j/7",
    description: "Unité spécialisée dans les violences basées sur le genre. Accueil confidentiel.",
  },
]

type ServiceListProps = {
  serviceType: string
  searchQuery: string
}

export function ServiceList({ serviceType, searchQuery }: ServiceListProps) {
  const filteredServices = mockServices.filter((service) => {
    const matchesType = serviceType === "all" || service.type === serviceType
    const matchesSearch =
      searchQuery === "" ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "health":
        return "Santé"
      case "legal":
        return "Juridique"
      case "ngo":
        return "ONG"
      case "police":
        return "Police"
      default:
        return type
    }
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case "health":
        return "bg-red-500"
      case "legal":
        return "bg-blue-500"
      case "ngo":
        return "bg-green-500"
      case "police":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {filteredServices.length === 0 ? (
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Aucun service trouvé pour votre recherche.</p>
          </CardContent>
        </Card>
      ) : (
        filteredServices.map((service) => (
          <Card key={service.id} className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                        <Badge className={`${getServiceTypeColor(service.type)} text-white`}>
                          {getServiceTypeLabel(service.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{service.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{service.phone}</span>
                    </div>
                    {service.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{service.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{service.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <Button className="gap-2 flex-1 md:flex-none">
                    <Navigation className="h-4 w-4" />
                    Itinéraire
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1 md:flex-none bg-transparent">
                    <Phone className="h-4 w-4" />
                    Appeler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
