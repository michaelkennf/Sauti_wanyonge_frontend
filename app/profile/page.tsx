"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService, type User } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UserIcon, Mail, Shield, MapPin, Calendar, LogOut, Edit } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    addToast("Déconnexion réussie", "success")
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        <main className="flex-1 container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Annuler" : "Modifier"}
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input value={user.email} disabled={!isEditing} className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                      <Shield className="h-4 w-4" />
                      Rôle
                    </Label>
                    <Input value={user.role} disabled className="bg-gray-50 capitalize" />
                  </div>

                  {user.province && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4" />
                        Province
                      </Label>
                      <Input value={user.province} disabled={!isEditing} className="bg-gray-50" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      Membre depuis
                    </Label>
                    <Input
                      value={new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {isEditing && <Button className="w-full">Enregistrer les modifications</Button>}

                <div className="pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50 bg-transparent"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
