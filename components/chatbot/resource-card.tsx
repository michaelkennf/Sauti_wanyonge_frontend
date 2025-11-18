import { Card, CardContent } from "@/components/ui/card"
import { Phone, MapPin } from "lucide-react"

type Resource = {
  title: string
  description: string
  contact?: string
  address?: string
}

type ResourceCardProps = {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4 space-y-2">
        <h4 className="font-semibold text-sm">{resource.title}</h4>
        <p className="text-xs text-muted-foreground">{resource.description}</p>
        <div className="space-y-1">
          {resource.contact && (
            <div className="flex items-center gap-2 text-xs">
              <Phone className="h-3 w-3 text-primary" />
              <span>{resource.contact}</span>
            </div>
          )}
          {resource.address && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{resource.address}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
