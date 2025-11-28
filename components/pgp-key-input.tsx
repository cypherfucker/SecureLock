"use client"

import { Textarea } from "@/components/ui/textarea"

interface PGPKeyInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function PGPKeyInput({ value, onChange, disabled, placeholder }: PGPKeyInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="font-mono text-sm min-h-[200px]"
    />
  )
}
