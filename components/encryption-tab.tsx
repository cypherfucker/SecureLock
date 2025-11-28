"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { PasswordInput } from "@/components/password-input"
import { PGPKeyInput } from "@/components/pgp-key-input"
import { FeaturesPanel } from "@/components/features-panel"
import { Button } from "@/components/ui/button"
import { Lock, Download } from "lucide-react"
import { encryptFile } from "@/lib/crypto"

export function EncryptionTab() {
  const [file, setFile] = useState<File | null>(null)
  const [encryptionMethod, setEncryptionMethod] = useState<"password" | "pgp">("password")
  const [password, setPassword] = useState("")
  const [pgpKey, setPgpKey] = useState("")
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [encryptedBlob, setEncryptedBlob] = useState<Blob | null>(null)

  const handleEncrypt = async () => {
    if (!file || (encryptionMethod === "password" && !password) || (encryptionMethod === "pgp" && !pgpKey)) {
      return
    }

    setIsEncrypting(true)
    setProgress(0)

    try {
      const result = await encryptFile(
        file,
        encryptionMethod === "password" ? password : pgpKey,
        encryptionMethod,
        (p) => setProgress(p),
      )
      setEncryptedBlob(result)
    } catch (error) {
      console.error("[v0] Encryption error:", error)
      alert("Encryption failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsEncrypting(false)
    }
  }

  const handleDownload = () => {
    if (!encryptedBlob || !file) return

    const url = URL.createObjectURL(encryptedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${file.name}.encrypted`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFile(null)
    setPassword("")
    setPgpKey("")
    setEncryptedBlob(null)
    setProgress(0)
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Choose File */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "#36b3fd", color: "white" }}
          >
            1
          </div>
          <h3 className="font-semibold text-lg">Choose a file to encrypt</h3>
        </div>
        <FileUpload file={file} onFileSelect={setFile} disabled={isEncrypting || !!encryptedBlob} />
        {!file && (
          <div className="mt-6">
            <FeaturesPanel />
          </div>
        )}
      </div>

      {/* Step 2: Encryption Method */}
      {file && !encryptedBlob && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#36b3fd", color: "white" }}
            >
              2
            </div>
            <h3 className="font-semibold text-lg">Select encryption method</h3>
          </div>
          <div className="flex gap-3">
            <Button
              variant={encryptionMethod === "password" ? "default" : "outline"}
              onClick={() => setEncryptionMethod("password")}
              className="flex-1"
              disabled={isEncrypting}
            >
              Password
            </Button>
            <Button
              variant={encryptionMethod === "pgp" ? "default" : "outline"}
              onClick={() => setEncryptionMethod("pgp")}
              className="flex-1"
              disabled={isEncrypting}
            >
              PGP Key
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Enter Credentials */}
      {file && !encryptedBlob && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#36b3fd", color: "white" }}
            >
              3
            </div>
            <h3 className="font-semibold text-lg">
              {encryptionMethod === "password" ? "Enter password" : "Enter PGP public key"}
            </h3>
          </div>
          {encryptionMethod === "password" ? (
            <PasswordInput
              value={password}
              onChange={setPassword}
              disabled={isEncrypting}
              placeholder="Enter a strong password"
            />
          ) : (
            <PGPKeyInput
              value={pgpKey}
              onChange={setPgpKey}
              disabled={isEncrypting}
              placeholder="Paste your PGP public key here"
            />
          )}
        </div>
      )}

      {/* Step 4: Encrypt */}
      {file && !encryptedBlob && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#36b3fd", color: "white" }}
            >
              4
            </div>
            <h3 className="font-semibold text-lg">Encrypt file</h3>
          </div>
          <Button
            onClick={handleEncrypt}
            disabled={
              isEncrypting || (encryptionMethod === "password" && !password) || (encryptionMethod === "pgp" && !pgpKey)
            }
            className="w-full"
            size="lg"
          >
            <Lock className="w-4 h-4 mr-2" />
            {isEncrypting ? `Encrypting... ${progress}%` : "Encrypt File"}
          </Button>
        </div>
      )}

      {/* Download Encrypted File */}
      {encryptedBlob && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-lg mb-1">✓ Encryption Complete</p>
              <p className="text-sm text-muted-foreground">Your file has been encrypted successfully</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownload} size="lg" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Encrypted File
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              Encrypt Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
