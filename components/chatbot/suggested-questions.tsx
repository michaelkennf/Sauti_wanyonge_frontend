"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

type SuggestedQuestionsProps = {
  onSelect: (question: string) => void
}

const questions = [
  "Où puis-je recevoir des soins médicaux ?",
  "Que faire après une agression ?",
  "Quels sont mes droits ?",
  "Comment déposer une plainte ?",
]

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HelpCircle className="h-4 w-4" />
        <span>Questions fréquentes :</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(question)}
            className="text-xs bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}
