"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { motion } from "framer-motion"

type TimelineItem = {
  status: string
  date: string | null
  description: string
  completed: boolean
}

type CaseTimelineProps = {
  timeline: TimelineItem[]
}

export function CaseTimeline({ timeline }: CaseTimelineProps) {
  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle>Historique du dossier</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    item.completed ? "bg-green-100 dark:bg-green-900/20" : "bg-muted"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                  ) : index === timeline.findIndex((t) => !t.completed) ? (
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                {index < timeline.length - 1 && (
                  <div className={`w-0.5 h-12 ${item.completed ? "bg-green-300 dark:bg-green-800" : "bg-muted"}`} />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.status}
                  </h4>
                  {item.date && <span className="text-sm text-muted-foreground">{item.date}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
