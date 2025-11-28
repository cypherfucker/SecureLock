"use client"

import type React from "react"

import { useRef } from "react"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  disabled?: boolean
}

export function FileUpload({ file, onFileSelect, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      onFileSelect(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (file) {
    return (
      <div className="border-2 border-dashed border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
          {!disabled && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFileSelect(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium mb-1">Drag & Drop or Browse file</p>
          <p className="text-sm text-muted-foreground">Any file type • No size limit</p>
        </div>
        <Button variant="secondary">
          <File className="w-4 h-4 mr-2" />
          Browse File
        </Button>
      </div>
      <input ref={inputRef} type="file" className="hidden" onChange={handleFileInput} disabled={disabled} />
    </div>
  )
}
