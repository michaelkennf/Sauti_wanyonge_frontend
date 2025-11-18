"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield, User } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "@/hooks/use-translation"
import type { ComplaintData } from "@/app/plainte/page"

type Step1Props = {
  data: Partial<ComplaintData>
  updateData: (data: Partial<ComplaintData>) => void
  onNext: () => void
}

export function ComplaintStep1({ data, updateData, onNext }: Step1Props) {
  const { t } = useTranslation()
  const [isAnonymous, setIsAnonymous] = useState(data.isAnonymous ?? true)
  const [name, setName] = useState(data.name ?? "")
  const [phone, setPhone] = useState(data.phone ?? "")
  const [email, setEmail] = useState(data.email ?? "")

  const handleNext = () => {
    updateData({
      isAnonymous,
      name: isAnonymous ? undefined : name,
      phone: isAnonymous ? undefined : phone,
      email: isAnonymous ? undefined : email,
    })
    onNext()
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{t('complaint.step1.title')}</CardTitle>
        <CardDescription>
          {t('complaint.step1.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={isAnonymous ? "anonymous" : "contact"}
          onValueChange={(value) => setIsAnonymous(value === "anonymous")}
          className="space-y-4"
        >
          <div
            className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
              isAnonymous ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => setIsAnonymous(true)}
          >
            <RadioGroupItem value="anonymous" id="anonymous" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="anonymous" className="flex items-center gap-2 cursor-pointer font-semibold text-base">
                <Shield className="h-5 w-5 text-primary" />
                {t('complaint.step1.anonymous')}
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                {t('complaint.step1.anonymousDescription')}
              </p>
            </div>
          </div>

          <div
            className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
              !isAnonymous ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => setIsAnonymous(false)}
          >
            <RadioGroupItem value="contact" id="contact" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="contact" className="flex items-center gap-2 cursor-pointer font-semibold text-base">
                <User className="h-5 w-5 text-primary" />
                {t('complaint.step1.contact')}
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                {t('complaint.step1.contactDescription')}
              </p>
            </div>
          </div>
        </RadioGroup>

        {!isAnonymous && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="name">{t('complaint.step1.fullName')}</Label>
              <Input id="name" placeholder={t('complaint.step1.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('complaint.step1.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+243 XXX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('complaint.step1.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} size="lg" className="min-w-[150px]">
            {t('common.next')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
