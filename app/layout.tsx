import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { TranslationProvider } from "@/hooks/use-translation"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sauti ya wa nyonge - Voix des Victimes",
  description:
    "Plateforme nationale de signalement et d'assistance aux victimes de violences sexuelles et basées sur le genre en RDC",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${poppins.variable} ${GeistMono.variable} antialiased`}>
        <TranslationProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <Analytics />
        </TranslationProvider>
      </body>
    </html>
  )
}
