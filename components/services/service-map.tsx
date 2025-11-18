"use client"

import { CardHeader } from "@/components/ui/card"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Navigation } from "lucide-react"
import { useState } from "react"

type Service = {
  id: number
  name: string
  type: string
  address: string
  phone: string
  hours: string
  lat: number
  lng: number
}

const mockServices: Service[] = [
  {
    id: 1,
    name: "Hôpital Général de Kinshasa",
    type: "health",
    address: "Avenue de la Libération, Kinshasa",
    phone: "+243 XXX XXX XXX",
    hours: "24h/24",
    lat: -4.3276,
    lng: 15.3136,
  },
  {
    id: 2,
    name: "Clinique Juridique de Kinshasa",
    type: "legal",
    address: "Boulevard du 30 Juin, Kinshasa",
    phone: "+243 XXX XXX XXX",
    hours: "Lun-Ven: 8h-17h",
    lat: -4.3217,
    lng: 15.3125,
  },
  {
    id: 3,
    name: "Centre Médical Lisanga",
    type: "health",
    address: "Quartier Ngaliema, Kinshasa",
    phone: "+243 XXX XXX XXX",
    hours: "Lun-Sam: 7h-19h",
    lat: -4.3356,
    lng: 15.2989,
  },
  {
    id: 4,
    name: "Association des Femmes Juristes",
    type: "ngo",
    address: "Commune de la Gombe, Kinshasa",
    phone: "+243 XXX XXX XXX",
    hours: "Lun-Ven: 9h-16h",
    lat: -4.3198,
    lng: 15.3245,
  },
]

type ServiceMapProps = {
  serviceType: string
  searchQuery: string
}

export function ServiceMap({ serviceType, searchQuery }: ServiceMapProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const filteredServices = mockServices.filter((service) => {
    const matchesType = serviceType === "all" || service.type === serviceType
    const matchesSearch =
      searchQuery === "" ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.address.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map */}
      <Card className="lg:col-span-2 border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-[600px] bg-muted">
            <img src="/map-of-kinshasa-with-markers.jpg" alt="Carte des services" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 text-center max-w-md">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Carte interactive</h3>
                <p className="text-sm text-muted-foreground">
                  La carte interactive avec les emplacements réels des services sera disponible prochainement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service List */}
      <div className="space-y-4">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Services trouvés</h3>
              <Badge variant="secondary">{filteredServices.length}</Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className={`border-border/50 cursor-pointer transition-all hover:shadow-md ${
                selectedService?.id === service.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedService(service)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm leading-tight">{service.name}</h4>
                  <Badge className={`${getServiceTypeColor(service.type)} text-white text-xs`}>
                    {getServiceTypeLabel(service.type)}
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{service.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{service.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{service.hours}</span>
                  </div>
                </div>
                <Button size="sm" className="w-full gap-2 mt-2">
                  <Navigation className="h-3 w-3" />
                  Itinéraire
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
