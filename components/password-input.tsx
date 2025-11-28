"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

function getPasswordStrength(password: string): "weak" | "medium" | "strong" | null {
  if (!password) return null

  const hasCapital = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  const isLongEnough = password.length >= 16

  // Red: Missing capitalized letter
  if (!hasCapital) return "weak"

  // Green: Has capital + number + special + 16+ chars
  if (hasCapital && hasNumber && hasSpecial && isLongEnough) return "strong"

  // Orange: Has capital but missing number OR special OR length
  return "medium"
}

export function PasswordInput({ value, onChange, disabled, placeholder }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const strength = getPasswordStrength(value)

  const getBackgroundColor = () => {
    if (!strength) return ""
    if (strength === "weak") return "bg-red-500/65"
    if (strength === "medium") return "bg-orange-500/65"
    if (strength === "strong") return "bg-green-500/65"
    return ""
  }

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`pr-10 ${getBackgroundColor()}`}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Eye className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
}
