"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServiceMap } from "@/components/services/service-map"
import { ServiceList } from "@/components/services/service-list"
import { MapPin, List, Search } from "lucide-react"

export default function ServicesPage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [serviceType, setServiceType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Services disponibles</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Trouvez les centres de santé, services juridiques et ONG près de chez vous.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-6">
            {/* Filters */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Rechercher un service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par nom ou localisation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Type de service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les services</SelectItem>
                      <SelectItem value="health">Centres de santé</SelectItem>
                      <SelectItem value="legal">Services juridiques</SelectItem>
                      <SelectItem value="ngo">ONG</SelectItem>
                      <SelectItem value="police">Commissariats</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "map" ? "default" : "outline"}
                      onClick={() => setViewMode("map")}
                      className="gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Carte
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      onClick={() => setViewMode("list")}
                      className="gap-2"
                    >
                      <List className="h-4 w-4" />
                      Liste
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            {viewMode === "map" ? (
              <ServiceMap serviceType={serviceType} searchQuery={searchQuery} />
            ) : (
              <ServiceList serviceType={serviceType} searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
