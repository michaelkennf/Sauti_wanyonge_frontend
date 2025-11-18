"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download } from "lucide-react"
import { ComplaintDetailsModal } from "./complaint-details-modal"

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

const mockComplaints: Complaint[] = [
  {
    id: "1",
    code: "ABC-123-XYZ",
    type: "Viol",
    date: "2024-01-15",
    location: "Kinshasa, Ngaliema",
    status: "En cours",
    urgency: "high",
    submittedDate: "2024-01-16",
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
  },
  {
    id: "3",
    code: "GHI-789-RST",
    type: "Violence domestique",
    date: "2024-01-20",
    location: "Goma, Karisimbi",
    status: "Reçue",
    urgency: "high",
    submittedDate: "2024-01-20",
  },
  {
    id: "4",
    code: "JKL-012-OPQ",
    type: "Enlèvement",
    date: "2024-01-12",
    location: "Kisangani, Makiso",
    status: "Clôturée",
    urgency: "low",
    submittedDate: "2024-01-13",
  },
]

export function ComplaintsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  const filteredComplaints = mockComplaints.filter((complaint) => {
    const matchesSearch =
      searchQuery === "" ||
      complaint.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || complaint.urgency === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-orange-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Urgent"
      case "medium":
        return "Moyen"
      case "low":
        return "Faible"
      default:
        return urgency
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des plaintes</h1>
          <p className="text-muted-foreground">Liste et suivi de toutes les plaintes</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

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
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes urgences</SelectItem>
                <SelectItem value="high">Urgent</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Plaintes ({filteredComplaints.length})</CardTitle>
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
                  <th className="text-left p-4 font-semibold text-sm">Urgence</th>
                  <th className="text-left p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm">{complaint.code}</span>
                    </td>
                    <td className="p-4 text-sm">{complaint.type}</td>
                    <td className="p-4 text-sm">{complaint.date}</td>
                    <td className="p-4 text-sm">{complaint.location}</td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(complaint.status)} text-white`}>{complaint.status}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getUrgencyColor(complaint.urgency)} text-white`}>
                        {getUrgencyLabel(complaint.urgency)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
      )}
    </div>
  )
}
