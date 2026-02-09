"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, Lock, Eye, FileText } from "lucide-react"

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
            </div>
            
            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6" />
                  1. Protection des Données
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Sauti ya wa nyonge s'engage à protéger la confidentialité et la sécurité de toutes les informations 
                  collectées sur cette plateforme. Toutes les données personnelles sont traitées conformément aux 
                  standards internationaux de protection des données.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                  2. Collecte d'Informations
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous collectons uniquement les informations nécessaires pour fournir nos services d'assistance 
                  aux victimes. Les signalements peuvent être effectués de manière anonyme, et aucune information 
                  personnelle n'est requise pour accéder aux services de base.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  3. Utilisation des Données
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Les données collectées sont utilisées exclusivement pour :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Fournir des services d'assistance aux victimes</li>
                  <li>Documenter les cas de violences pour des fins statistiques et de prévention</li>
                  <li>Améliorer la qualité de nos services</li>
                  <li>Respecter les obligations légales et réglementaires</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Sécurité des Données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour 
                  protéger vos données contre tout accès non autorisé, perte, destruction ou altération. Toutes les 
                  communications sont chiffrées et les données sensibles sont stockées de manière sécurisée.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Partage des Données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous ne partageons vos données personnelles qu'avec votre consentement explicite ou lorsque la 
                  loi l'exige. Les données peuvent être partagées avec des partenaires de confiance (ONG, services 
                  médicaux, juridiques) uniquement dans le cadre de l'assistance aux victimes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Vos Droits</h2>
                <p className="text-gray-700 leading-relaxed">
                  Vous avez le droit d'accéder, de rectifier, de supprimer ou de limiter le traitement de vos 
                  données personnelles. Pour exercer ces droits, veuillez nous contacter via les canaux de 
                  communication officiels.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter 
                  via la page de contact de la plateforme.
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
