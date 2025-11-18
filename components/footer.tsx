import Link from "next/link"
import { Phone, Mail, MapPin, Shield } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-16 w-16">
                <Image src="/logo-sauti-ya-wayonge.png" alt="Sauti ya Wayonge Logo" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-semibold">Sauti ya Wayonge</h3>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Plateforme nationale de signalement et d'assistance aux victimes de violences sexuelles et basées sur le
              genre en RDC.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/plainte"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Déposer une plainte
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
                <span className="text-primary-foreground/80">contact@sautiyawayonge.cd</span>
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
            <div className="h-20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rdc-T61e4MfAqibYSfXUqeNUMi2RQkbaDr.png"
                alt="Gouvernement de la République Démocratique du Congo"
                className="h-full w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <div className="h-20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fonarev-tUSviZpD7w4th3RistQYLyW6cxpQJE.jpeg"
                alt="FONAREV - Fonds National pour la Réparation des Victimes"
                className="h-full w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <div className="h-20 flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-05-16%20%C3%A0%2020.56.29_cfa01b3c-2M8Gpc0uTQof3oQ7ljaEwMVjdAEi2K.jpg"
                alt="PNUD - Programme des Nations Unies pour le Développement RDC"
                className="h-full w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} Sauti ya Wayonge. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
