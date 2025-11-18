"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Fingerprint, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Eye,
  Clock
} from "lucide-react"
import Link from "next/link"

export default function InvestigatorFlowTestPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [biometricStatus, setBiometricStatus] = useState<'not_registered' | 'registered' | 'verified'>('not_registered')

  const steps = [
    {
      id: 1,
      title: "Connexion Enquêteur",
      description: "Authentification avec email/mot de passe",
      path: "/auth/investigator-login",
      icon: User,
      status: "completed"
    },
    {
      id: 2,
      title: "Vérification Biométrique",
      description: "Enregistrement ou vérification des empreintes",
      path: "/enqueteur/formulaire",
      icon: Fingerprint,
      status: biometricStatus === 'verified' ? "completed" : biometricStatus === 'registered' ? "in_progress" : "pending"
    },
    {
      id: 3,
      title: "Formulaire d'Enquête",
      description: "Collecte des données du bénéficiaire",
      path: "/enqueteur/formulaire",
      icon: FileText,
      status: biometricStatus === 'verified' ? "available" : "locked"
    },
    {
      id: 4,
      title: "Dashboard Enquêteur",
      description: "Vue des enquêtes en cours",
      path: "/enqueteur/dashboard",
      icon: Shield,
      status: "available"
    }
  ]

  const simulateBiometricFlow = () => {
    if (biometricStatus === 'not_registered') {
      setBiometricStatus('registered')
      setTimeout(() => {
        setBiometricStatus('verified')
      }, 2000)
    }
  }

  const resetFlow = () => {
    setBiometricStatus('not_registered')
    setCurrentStep(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-yellow-500'
      case 'available': return 'bg-blue-500'
      case 'locked': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé'
      case 'in_progress': return 'En cours'
      case 'available': return 'Disponible'
      case 'locked': return 'Verrouillé'
      default: return 'En attente'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Test du Flux Enquêteur
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Simulation complète du processus d'authentification et d'enquête
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={resetFlow} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Réinitialiser
            </Button>
            <Button asChild>
              <Link href="/test-flux" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Tous les flux
              </Link>
            </Button>
          </div>
        </div>

        {/* Statut biométrique actuel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Statut Biométrique Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge 
                  variant={biometricStatus === 'verified' ? 'default' : 'secondary'}
                  className="gap-2"
                >
                  <Fingerprint className="h-3 w-3" />
                  {biometricStatus === 'not_registered' && 'Non enregistré'}
                  {biometricStatus === 'registered' && 'Enregistré'}
                  {biometricStatus === 'verified' && 'Vérifié'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {biometricStatus === 'not_registered' && 'Premier accès - Enregistrement requis'}
                  {biometricStatus === 'registered' && 'Empreintes enregistrées - Vérification requise'}
                  {biometricStatus === 'verified' && 'Identité vérifiée - Accès autorisé'}
                </span>
              </div>
              <Button 
                onClick={simulateBiometricFlow}
                disabled={biometricStatus === 'verified'}
                variant="outline"
                size="sm"
              >
                {biometricStatus === 'not_registered' && 'Simuler Enregistrement'}
                {biometricStatus === 'registered' && 'Simuler Vérification'}
                {biometricStatus === 'verified' && 'Vérifié ✓'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Étapes du flux */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all ${
                step.status === 'locked' ? 'opacity-50' : 'hover:shadow-lg'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Icône avec statut */}
                    <div className={`p-3 rounded-full ${getStatusColor(step.status)} text-white`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                          {getStatusText(step.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        {step.status !== 'locked' ? (
                          <Button asChild size="sm">
                            <Link href={step.path}>
                              {step.status === 'completed' ? 'Revisiter' : 'Accéder'}
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" disabled>
                            Verrouillé
                          </Button>
                        )}
                        
                        {step.id === 2 && biometricStatus === 'not_registered' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={simulateBiometricFlow}
                          >
                            Simuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Instructions de test */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instructions de Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Compte de test :</h4>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <div><strong>Email :</strong> investigator@sauti-ya-wayonge.cd</div>
                  <div><strong>Mot de passe :</strong> investigator123</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Flux attendu :</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Connexion avec email/mot de passe</li>
                  <li>Redirection vers le formulaire</li>
                  <li>Vérification biométrique obligatoire</li>
                  <li>Accès au formulaire d'enquête</li>
                </ol>
              </div>
            </div>
            
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>Note :</strong> Le système biométrique est simulé. En production, 
                il utiliserait l'API WebAuthn pour la capture réelle des empreintes digitales.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
