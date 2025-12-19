"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ComplaintStep1 } from "@/components/complaint/step-1"
import { ComplaintStep2 } from "@/components/complaint/step-2"
import { ComplaintStep3 } from "@/components/complaint/step-3"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export type ComplaintData = {
  isAnonymous: boolean
  name?: string
  phone?: string
  email?: string
  incidentType: string
  date: string
  location: string
  description: string
  evidence: File[]
  needs: string[]
  audioRecording?: Blob
  videoRecording?: Blob
}

export default function ComplaintPage() {
  const { toasts, removeToast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [complaintData, setComplaintData] = useState<Partial<ComplaintData>>({
    isAnonymous: true,
    evidence: [],
    needs: [],
  })

  const updateComplaintData = (data: Partial<ComplaintData>) => {
    setComplaintData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Signaler un cas</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Vos informations sont protégées et confidentielles. Complétez les étapes suivantes pour signaler un
              incident.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step}
                    </div>
                    <span className="text-xs mt-2 text-center hidden sm:block">
                      {step === 1 && "Anonymat"}
                      {step === 2 && "Détails"}
                      {step === 3 && "Confirmation"}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                        currentStep > step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ComplaintStep1 data={complaintData} updateData={updateComplaintData} onNext={nextStep} />
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ComplaintStep2
                    data={complaintData}
                    updateData={updateComplaintData}
                    onNext={nextStep}
                    onBack={prevStep}
                  />
                </motion.div>
              )}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ComplaintStep3 data={complaintData} onBack={prevStep} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
