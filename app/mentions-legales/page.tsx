"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FileText, Building2, Mail, Globe } from "lucide-react"

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Mentions Légales</h1>
            </div>
            
            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  1. Éditeur du Site
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le site <strong>vbgsos.fikiri.org</strong> est édité par Sauti ya wa nyonge, 
                  plateforme nationale de signalement et d'assistance aux victimes de violences 
                  sexuelles et basées sur le genre en République démocratique du Congo.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  2. Hébergement
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Le site est hébergé sur des serveurs sécurisés conformes aux standards internationaux 
                  de sécurité et de protection des données.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Propriété Intellectuelle</h2>
                <p className="text-gray-700 leading-relaxed">
                  L'ensemble du contenu de ce site (textes, images, logos, graphismes, etc.) est la 
                  propriété exclusive de Sauti ya wa nyonge ou de ses partenaires. Toute reproduction, 
                  même partielle, est interdite sans autorisation préalable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Responsabilité</h2>
                <p className="text-gray-700 leading-relaxed">
                  Sauti ya wa nyonge s'efforce d'assurer l'exactitude et la mise à jour des informations 
                  diffusées sur ce site. Cependant, l'organisation ne peut être tenue responsable des erreurs, 
                  omissions ou résultats qui pourraient résulter de l'utilisation de ces informations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Liens Externes</h2>
                <p className="text-gray-700 leading-relaxed">
                  Le site peut contenir des liens vers des sites externes. Sauti ya wa nyonge n'exerce 
                  aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou 
                  leur accessibilité.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Protection des Données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Conformément à la législation en vigueur, vous disposez d'un droit d'accès, de rectification 
                  et de suppression des données vous concernant. Pour exercer ce droit, veuillez nous contacter 
                  via les canaux de communication officiels.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6" />
                  7. Contact
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour toute question concernant ces mentions légales ou le site, vous pouvez nous contacter 
                  via la page de contact de la plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Droit Applicable</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes mentions légales sont régies par le droit de la République démocratique du Congo. 
                  Tout litige relatif à l'utilisation du site sera de la compétence exclusive des tribunaux 
                  compétents de la RDC.
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
