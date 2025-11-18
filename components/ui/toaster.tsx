"use client"

import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return <ToastContainer toasts={toasts} removeToast={removeToast} />
}
