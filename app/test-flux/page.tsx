"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  User, 
  Building, 
  Eye, 
  Fingerprint, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Users,
  BarChart3,
  Settings
} from "lucide-react"
import Link from "next/link"

export default function UserFlowTestPage() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  const userRoles = [
    {
      id: 'admin',
      name: 'Administrateur',
      icon: Shield,
      color: 'bg-red-500',
      description: 'Gestion complète du système',
      pages: [
        { path: '/admin', name: 'Dashboard Admin', description: 'Vue d\'ensemble du système' },
        { path: '/admin/users', name: 'Gestion Utilisateurs', description: 'Créer et gérer les comptes' },
        { path: '/admin/investigators', name: 'Gestion Enquêteurs', description: 'Gérer les enquêteurs et leur statut biométrique' },
        { path: '/admin/complaints', name: 'Toutes les Plaintes', description: 'Voir toutes les plaintes du système' },
        { path: '/admin/analytics', name: 'Analytiques IA', description: 'Analyses et rapports' }
      ],
      loginPath: '/auth/login',
      testCredentials: { email: 'admin@sauti-ya-wayonge.cd', password: 'admin123' }
    },
    {
      id: 'investigator',
      name: 'Enquêteur',
      icon: User,
      color: 'bg-blue-500',
      description: 'Collecte de données sur le terrain',
      pages: [
        { path: '/auth/investigator-login', name: 'Connexion Enquêteur', description: 'Authentification avec biométrie' },
        { path: '/enqueteur/formulaire', name: 'Formulaire d\'Enquête', description: 'Formulaire complet avec vérification biométrique' },
        { path: '/enqueteur/dashboard', name: 'Dashboard Enquêteur', description: 'Vue des enquêtes en cours' }
      ],
      loginPath: '/auth/investigator-login',
      testCredentials: { email: 'investigator@sauti-ya-wayonge.cd', password: 'investigator123' }
    },
    {
      id: 'ngo',
      name: 'ONG',
      icon: Building,
      color: 'bg-green-500',
      description: 'Gestion des plaintes régionales',
      pages: [
        { path: '/ngo/dashboard', name: 'Dashboard ONG', description: 'Plaintes assignées à la région' },
        { path: '/ong/plaintes', name: 'Gestion Plaintes', description: 'Traiter les plaintes régionales' }
      ],
      loginPath: '/auth/login',
      testCredentials: { email: 'ngo@sauti-ya-wayonge.cd', password: 'ngo123' }
    },
    {
      id: 'assurance',
      name: 'Assurance',
      icon: Eye,
      color: 'bg-purple-500',
      description: 'Analyse globale et rapports',
      pages: [
        { path: '/assurance/dashboard', name: 'Dashboard Assurance', description: 'Analyse globale avec IA' }
      ],
      loginPath: '/auth/login',
      testCredentials: { email: 'assurance@sauti-ya-wayonge.cd', password: 'assurance123' }
    }
  ]

  const publicPages = [
    { path: '/', name: 'Accueil', description: 'Page d\'accueil publique' },
    { path: '/plainte', name: 'Déposer une Plainte', description: 'Formulaire pour victimes' },
    { path: '/chatbot', name: 'Chatbot IA', description: 'Assistant virtuel 24/7' },
    { path: '/suivi', name: 'Suivi de Plainte', description: 'Consulter le statut d\'une plainte' },
    { path: '/about', name: 'À Propos', description: 'Informations sur la plateforme' },
    { path: '/contact', name: 'Contact', description: 'Nous contacter' },
    { path: '/services', name: 'Services', description: 'Services disponibles' }
  ]

  const testPage = async (path: string) => {
    try {
      const response = await fetch(path, { method: 'HEAD' })
      const isAccessible = response.ok
      setTestResults(prev => ({ ...prev, [path]: isAccessible }))
      return isAccessible
    } catch {
      setTestResults(prev => ({ ...prev, [path]: false }))
      return false
    }
  }

  const testAllPages = async () => {
    const allPages = [
      ...publicPages.map(p => p.path),
      ...userRoles.flatMap(role => role.pages.map(p => p.path))
    ]
    
    for (const path of allPages) {
      await testPage(path)
      // Petit délai pour éviter de surcharger
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Test des Flux Utilisateur
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Vérification complète de tous les flux et interfaces de l'application
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={testAllPages} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Tester toutes les pages
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>

        {/* Pages publiques */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pages Publiques
            </CardTitle>
            <CardDescription>
              Pages accessibles sans authentification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicPages.map((page) => (
                <motion.div
                  key={page.path}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{page.name}</h3>
                    <Badge variant={testResults[page.path] ? "default" : "secondary"}>
                      {testResults[page.path] ? "✓" : "?"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{page.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={page.path}>Visiter</Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => testPage(page.path)}
                    >
                      Tester
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rôles utilisateur */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {userRoles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${role.color} text-white`}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  {role.name}
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Credentials de test */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Compte de test :</strong><br />
                    Email: {role.testCredentials.email}<br />
                    Mot de passe: {role.testCredentials.password}
                  </AlertDescription>
                </Alert>

                {/* Pages du rôle */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Pages disponibles :</h4>
                  {role.pages.map((page) => (
                    <div key={page.path} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{page.name}</h5>
                          <Badge variant={testResults[page.path] ? "default" : "secondary"}>
                            {testResults[page.path] ? "✓" : "?"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{page.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={page.path}>Visiter</Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => testPage(page.path)}
                        >
                          Tester
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bouton de connexion */}
                <Button asChild className="w-full">
                  <Link href={role.loginPath} className="gap-2">
                    <Fingerprint className="h-4 w-4" />
                    Se connecter comme {role.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Résumé des tests */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Résumé des Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).filter(Boolean).length}
                </div>
                <div className="text-sm text-green-600">Pages Accessibles</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(testResults).filter(v => v === false).length}
                </div>
                <div className="text-sm text-red-600">Pages Inaccessibles</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {Object.keys(testResults).length}
                </div>
                <div className="text-sm text-gray-600">Total Testé</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
