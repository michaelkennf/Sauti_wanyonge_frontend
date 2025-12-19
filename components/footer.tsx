"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, Shield } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/plainte"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Signaler un cas
                </Link>
              </li>
              <li>
                <Link
                  href="/suivi"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Suivre mon dossier
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Services disponibles
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contacts d'urgence</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-primary-foreground/80">+243 XXX XXX XXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-primary-foreground/80">contact@sautiyawanyonge.cd</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-primary-foreground/80">Kinshasa, RDC</span>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations légales</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/confidentialite"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <div className="flex items-center justify-center gap-2 text-sm text-primary-foreground/80 mb-6">
            <Shield className="h-5 w-5" />
            <p className="text-center">
              Vos données sont hébergées de façon souveraine et chiffrée. Panic Button disponible sur toutes les pages.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-8 border-t border-primary-foreground/20">
          <h3 className="text-center text-lg font-semibold mb-6">Nos Partenaires</h3>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="h-20 w-20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <Image
                src="/BCNUDH.jpeg"
                alt="BCNUDH - Bureau Conjoint des Nations Unies aux Droits de l'Homme"
                width={80}
                height={80}
                className="h-full w-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                unoptimized
              />
            </div>
            <div className="h-20 w-20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <Image
                src="/UNICEF.png"
                alt="UNICEF - Fonds des Nations Unies pour l'Enfance"
                width={80}
                height={80}
                className="h-full w-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                unoptimized
              />
            </div>
            <div className="h-20 w-20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <Image
                src="/unfa.png"
                alt="UNFPA - Fonds des Nations Unies pour la Population"
                width={80}
                height={80}
                className="h-full w-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                unoptimized
              />
            </div>
            <div className="h-20 w-20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <Image
                src="/onu_femme.png"
                alt="ONU Femmes - Entité des Nations Unies pour l'égalité des sexes et l'autonomisation des femmes"
                width={80}
                height={80}
                className="h-full w-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                unoptimized
              />
            </div>
            <div className="h-20 w-20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <Image
                src="/pnud.png"
                alt="PNUD - Programme des Nations Unies pour le Développement RDC"
                width={80}
                height={80}
                className="h-full w-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                unoptimized
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} Sauti ya wa nyonge. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
