/**
 * Composant Motion optimisé avec lazy loading
 * Utilise dynamic import pour réduire le bundle initial
 */
"use client"

import { lazy, Suspense } from "react"

// Lazy load framer-motion seulement quand nécessaire
const MotionDiv = lazy(() => 
  import("framer-motion").then((mod) => ({ default: mod.motion.div }))
)

const MotionSpan = lazy(() => 
  import("framer-motion").then((mod) => ({ default: mod.motion.span }))
)

interface LazyMotionProps {
  children: React.ReactNode
  className?: string
  initial?: any
  animate?: any
  transition?: any
  [key: string]: any
}

export function LazyMotion({ children, ...props }: LazyMotionProps) {
  return (
    <Suspense fallback={<div {...props}>{children}</div>}>
      <MotionDiv {...props}>{children}</MotionDiv>
    </Suspense>
  )
}

// Version simplifiée sans animation pour les cas où l'animation n'est pas critique
export function StaticMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

