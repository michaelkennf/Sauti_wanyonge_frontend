"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Shield, Building, UserCheck, Eye, Fingerprint } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Types
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'investigator' | 'ngo' | 'assurance'
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  lastLogin?: string
}

interface Investigator extends User {
  badgeNumber: string
  department: string
  biometricRegistered: boolean
}

interface NGO extends User {
  registrationNumber: string
  contactPerson: string
  region: string
}

interface Assurance extends User {
  department: string
  accessLevel: 'global' | 'regional'
}

export function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin Principal',
      email: 'admin@sauti-ya-wayonge.cd',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01',
      lastLogin: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jean Mukamba',
      email: 'jean.mukamba@investigator.cd',
      role: 'investigator',
      status: 'active',
      createdAt: '2024-01-05',
      lastLogin: '2024-01-14'
    }
  ])

  const [investigators, setInvestigators] = useState<Investigator[]>([
    {
      id: '2',
      name: 'Jean Mukamba',
      email: 'jean.mukamba@investigator.cd',
      role: 'investigator',
      status: 'active',
      createdAt: '2024-01-05',
      lastLogin: '2024-01-14',
      badgeNumber: 'INV-001',
      department: 'Police Nationale',
      biometricRegistered: false // Changé à false pour tester l'enregistrement
    }
  ])

  const [ngos, setNgos] = useState<NGO[]>([
    {
      id: '3',
      name: 'Femme Plus',
      email: 'contact@femmeplus.cd',
      role: 'ngo',
      status: 'active',
      createdAt: '2024-01-10',
      lastLogin: '2024-01-13',
      registrationNumber: 'NGO-001',
      contactPerson: 'Marie Kabila',
      region: 'Kinshasa'
    }
  ])

  const [assurances, setAssurances] = useState<Assurance[]>([
    {
      id: '4',
      name: 'Assurance Globale',
      email: 'assurance@sauti-ya-wayonge.cd',
      role: 'assurance',
      status: 'active',
      createdAt: '2024-01-08',
      lastLogin: '2024-01-12',
      department: 'Analyse et Rapports',
      accessLevel: 'global'
    }
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'investigator' as const,
    badgeNumber: '',
    department: '',
    registrationNumber: '',
    contactPerson: '',
    region: '',
    accessLevel: 'global' as const
  })

  const updateBiometricStatus = (investigatorId: string, isRegistered: boolean) => {
    setInvestigators(prev => 
      prev.map(inv => 
        inv.id === investigatorId 
          ? { ...inv, biometricRegistered: isRegistered }
          : inv
      )
    )
    
    toast({
      title: "Statut biométrique mis à jour",
      description: `L'enquêteur ${isRegistered ? 'a enregistré' : 'n\'a pas encore enregistré'} ses empreintes`,
    })
  }

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setUsers([...users, user])

    if (newUser.role === 'investigator') {
      const investigator: Investigator = {
        ...user,
        badgeNumber: newUser.badgeNumber,
        department: newUser.department,
        biometricRegistered: false
      }
      setInvestigators([...investigators, investigator])
    } else if (newUser.role === 'ngo') {
      const ngo: NGO = {
        ...user,
        registrationNumber: newUser.registrationNumber,
        contactPerson: newUser.contactPerson,
        region: newUser.region
      }
      setNgos([...ngos, ngo])
    } else if (newUser.role === 'assurance') {
      const assurance: Assurance = {
        ...user,
        department: newUser.department,
        accessLevel: newUser.accessLevel
      }
      setAssurances([...assurances, assurance])
    }

    toast({
      title: "Succès",
      description: "Utilisateur créé avec succès"
    })

    setIsCreateDialogOpen(false)
    setNewUser({
      name: '',
      email: '',
      role: 'investigator',
      badgeNumber: '',
      department: '',
      registrationNumber: '',
      contactPerson: '',
      region: '',
      accessLevel: 'global'
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'investigator': return <UserCheck className="h-4 w-4" />
      case 'ngo': return <Building className="h-4 w-4" />
      case 'assurance': return <Eye className="h-4 w-4" />
      default: return <UserCheck className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default" className="bg-green-500">Actif</Badge>
      case 'inactive': return <Badge variant="secondary">Inactif</Badge>
      case 'pending': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En attente</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau compte utilisateur
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="role">Rôle *</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investigator">Enquêteur</SelectItem>
                    <SelectItem value="ngo">ONG</SelectItem>
                    <SelectItem value="assurance">Assurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newUser.role === 'investigator' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badgeNumber">Numéro de badge</Label>
                    <Input
                      id="badgeNumber"
                      value={newUser.badgeNumber}
                      onChange={(e) => setNewUser({ ...newUser, badgeNumber: e.target.value })}
                      placeholder="INV-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      placeholder="Police Nationale"
                    />
                  </div>
                </div>
              )}

              {newUser.role === 'ngo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="registrationNumber">Numéro d'enregistrement</Label>
                      <Input
                        id="registrationNumber"
                        value={newUser.registrationNumber}
                        onChange={(e) => setNewUser({ ...newUser, registrationNumber: e.target.value })}
                        placeholder="NGO-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Personne de contact</Label>
                      <Input
                        id="contactPerson"
                        value={newUser.contactPerson}
                        onChange={(e) => setNewUser({ ...newUser, contactPerson: e.target.value })}
                        placeholder="Marie Kabila"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="region">Région</Label>
                    <Input
                      id="region"
                      value={newUser.region}
                      onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
                      placeholder="Kinshasa"
                    />
                  </div>
                </div>
              )}

              {newUser.role === 'assurance' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      placeholder="Analyse et Rapports"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accessLevel">Niveau d'accès</Label>
                    <Select value={newUser.accessLevel} onValueChange={(value: any) => setNewUser({ ...newUser, accessLevel: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="regional">Régional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateUser}>
                  Créer l'utilisateur
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="investigators" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="investigators">Enquêteurs</TabsTrigger>
          <TabsTrigger value="ngos">ONG</TabsTrigger>
          <TabsTrigger value="assurances">Assurances</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>

        <TabsContent value="investigators">
          <Card>
            <CardHeader>
              <CardTitle>Enquêteurs</CardTitle>
              <CardDescription>Gérez les comptes des enquêteurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Biométrie</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investigators.map((investigator) => (
                    <TableRow key={investigator.id}>
                      <TableCell className="font-medium">{investigator.name}</TableCell>
                      <TableCell>{investigator.email}</TableCell>
                      <TableCell>{investigator.badgeNumber}</TableCell>
                      <TableCell>{investigator.department}</TableCell>
                      <TableCell>
                        <Badge variant={investigator.biometricRegistered ? "default" : "secondary"}>
                          {investigator.biometricRegistered ? "Enregistrée" : "Non enregistrée"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(investigator.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateBiometricStatus(investigator.id, !investigator.biometricRegistered)}
                            title={investigator.biometricRegistered ? "Marquer comme non enregistré" : "Marquer comme enregistré"}
                          >
                            <Fingerprint className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ngos">
          <Card>
            <CardHeader>
              <CardTitle>Organisations Non Gouvernementales</CardTitle>
              <CardDescription>Gérez les comptes des ONG</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Région</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ngos.map((ngo) => (
                    <TableRow key={ngo.id}>
                      <TableCell className="font-medium">{ngo.name}</TableCell>
                      <TableCell>{ngo.email}</TableCell>
                      <TableCell>{ngo.registrationNumber}</TableCell>
                      <TableCell>{ngo.contactPerson}</TableCell>
                      <TableCell>{ngo.region}</TableCell>
                      <TableCell>{getStatusBadge(ngo.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assurances">
          <Card>
            <CardHeader>
              <CardTitle>Assurances</CardTitle>
              <CardDescription>Gérez les comptes des assurances</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Accès</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assurances.map((assurance) => (
                    <TableRow key={assurance.id}>
                      <TableCell className="font-medium">{assurance.name}</TableCell>
                      <TableCell>{assurance.email}</TableCell>
                      <TableCell>{assurance.department}</TableCell>
                      <TableCell>
                        <Badge variant={assurance.accessLevel === 'global' ? "default" : "secondary"}>
                          {assurance.accessLevel === 'global' ? "Global" : "Régional"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(assurance.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tous les utilisateurs</CardTitle>
              <CardDescription>Vue d'ensemble de tous les utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>{user.lastLogin || 'Jamais'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
