"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Languages, CheckCircle, ArrowRight } from "lucide-react"
import { useTranslation, useLocale } from "@/hooks/use-translation"

export default function MultilingualDemoPage() {
  const { t } = useTranslation()
  const { locale, setLocale, languageName, languageFlag, allLanguages } = useLocale()
  const [selectedDemo, setSelectedDemo] = useState<'nav' | 'auth' | 'form' | 'admin'>('nav')

  const demoSections = [
    { id: 'nav', title: 'Navigation', description: 'Menu principal et navigation' },
    { id: 'auth', title: 'Authentification', description: 'Connexion et sécurité' },
    { id: 'form', title: 'Formulaire', description: 'Formulaires d\'enquête' },
    { id: 'admin', title: 'Administration', description: 'Gestion des utilisateurs' }
  ]

  const getDemoContent = () => {
    switch (selectedDemo) {
      case 'nav':
        return (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm">{t('nav.home')}</Button>
              <Button variant="outline" size="sm">{t('nav.complaint')}</Button>
              <Button variant="outline" size="sm">{t('nav.chatbot')}</Button>
              <Button variant="outline" size="sm">{t('nav.tracking')}</Button>
              <Button variant="outline" size="sm">{t('nav.about')}</Button>
              <Button variant="outline" size="sm">{t('nav.contact')}</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">{t('nav.login')}</Button>
              <Button variant="outline" size="sm">{t('nav.profile')}</Button>
              <Button variant="outline" size="sm">{t('nav.logout')}</Button>
            </div>
          </div>
        )
      case 'auth':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.email')}</label>
              <input 
                type="email" 
                placeholder="enqueteur@sauti-ya-wayonge.rdc"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.password')}</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <Button className="w-full">{t('auth.loginButton')}</Button>
          </div>
        )
      case 'form':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('investigatorForm.beneficiary.fullName')}</label>
              <input 
                type="text" 
                placeholder={t('investigatorForm.beneficiary.fullName')}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('investigatorForm.beneficiary.sex')}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="sex" value="female" />
                  {t('investigatorForm.beneficiary.female')}
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="sex" value="male" />
                  {t('investigatorForm.beneficiary.male')}
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('investigatorForm.incident.type')}</label>
              <select className="w-full p-2 border rounded-md">
                <option>{t('investigatorForm.incident.types.sexualViolence')}</option>
                <option>{t('investigatorForm.incident.types.domesticViolence')}</option>
                <option>{t('investigatorForm.incident.types.physicalViolence')}</option>
              </select>
            </div>
            <Button className="w-full">{t('investigatorForm.actions.submit')}</Button>
          </div>
        )
      case 'admin':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">{t('admin.newUser')}</Button>
              <Button variant="outline" size="sm">{t('admin.createUser')}</Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('admin.role')}</label>
              <select className="w-full p-2 border rounded-md">
                <option>{t('admin.roles.admin')}</option>
                <option>{t('admin.roles.investigator')}</option>
                <option>{t('admin.roles.ngo')}</option>
                <option>{t('admin.roles.assurance')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('admin.status')}</label>
              <div className="flex gap-2">
                <Badge variant="default">{t('admin.active')}</Badge>
                <Badge variant="secondary">{t('admin.pending')}</Badge>
                <Badge variant="destructive">{t('admin.inactive')}</Badge>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-3 mb-4">
                <Globe className="h-10 w-10" />
                Support Multilingue
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Démonstration du système de traduction en temps réel
              </p>
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {languageFlag} {languageName}
                </Badge>
                <span className="text-muted-foreground">Langue actuelle</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sélecteur de langue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Changer de langue
                </CardTitle>
                <CardDescription>
                  Sélectionnez une langue pour voir les traductions en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {allLanguages.map((lang) => (
                  <motion.div
                    key={lang.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={locale === lang.code ? "default" : "outline"}
                      className="w-full justify-start gap-3"
                      onClick={() => setLocale(lang.code)}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                      {locale === lang.code && (
                        <CheckCircle className="h-4 w-4 ml-auto" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Sélecteur de démo */}
            <Card>
              <CardHeader>
                <CardTitle>Section de démonstration</CardTitle>
                <CardDescription>
                  Choisissez une section pour voir les traductions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {demoSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={selectedDemo === section.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedDemo(section.id as any)}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {section.title}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {section.description}
                    </span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Contenu de démonstration */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {demoSections.find(s => s.id === selectedDemo)?.title}
                </CardTitle>
                <CardDescription>
                  {demoSections.find(s => s.id === selectedDemo)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  key={`${selectedDemo}-${locale}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {getDemoContent()}
                </motion.div>
              </CardContent>
            </Card>
          </div>

          {/* Informations techniques */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Informations techniques</CardTitle>
              <CardDescription>
                Détails sur l'implémentation du système multilingue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Langues supportées</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Français (fr) - Langue par défaut</li>
                    <li>• Swahili (sw) - Langue régionale</li>
                    <li>• Lingala (ln) - Langue locale</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Fonctionnalités</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Changement de langue en temps réel</li>
                    <li>• Persistance des préférences</li>
                    <li>• Interpolation de paramètres</li>
                    <li>• Fallback automatique</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Technologies</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• React Context API</li>
                    <li>• TypeScript pour la sécurité des types</li>
                    <li>• localStorage pour la persistance</li>
                    <li>• Framer Motion pour les animations</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Utilisation</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Hook useTranslation()</li>
                    <li>• Hook useLocale()</li>
                    <li>• Fonction t(key, params)</li>
                    <li>• Provider TranslationProvider</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}