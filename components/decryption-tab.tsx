"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { PasswordInput } from "@/components/password-input"
import { PGPKeyInput } from "@/components/pgp-key-input"
import { FeaturesPanel } from "@/components/features-panel"
import { Button } from "@/components/ui/button"
import { Key, Download, AlertCircle } from "lucide-react"
import { decryptFile } from "@/lib/crypto"

export function DecryptionTab() {
  const [file, setFile] = useState<File | null>(null)
  const [decryptionMethod, setDecryptionMethod] = useState<"password" | "pgp">("password")
  const [password, setPassword] = useState("")
  const [pgpKey, setPgpKey] = useState("")
  const [pgpPassphrase, setPgpPassphrase] = useState("")
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null)
  const [decryptedFileName, setDecryptedFileName] = useState("")
  const [showInvalidFileError, setShowInvalidFileError] = useState(false)

  const handleDecrypt = async () => {
    if (!file || (decryptionMethod === "password" && !password) || (decryptionMethod === "pgp" && !pgpKey)) {
      return
    }

    setIsDecrypting(true)
    setProgress(0)
    setShowInvalidFileError(false)

    try {
      const result = await decryptFile(
        file,
        decryptionMethod === "password" ? password : pgpKey,
        decryptionMethod,
        (p) => setProgress(p),
        decryptionMethod === "pgp" ? pgpPassphrase : undefined,
      )
      setDecryptedBlob(result.blob)
      setDecryptedFileName(result.fileName)
    } catch (error) {
      console.error("[v0] Decryption error:", error)
      if (error instanceof Error && error.message === "INVALID_FILE_FORMAT") {
        setShowInvalidFileError(true)
      } else {
        alert("Decryption failed: " + (error instanceof Error ? error.message : "Unknown error"))
      }
    } finally {
      setIsDecrypting(false)
    }
  }

  const handleDownload = () => {
    if (!decryptedBlob) return

    const url = URL.createObjectURL(decryptedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = decryptedFileName || "decrypted-file"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFile(null)
    setPassword("")
    setPgpKey("")
    setPgpPassphrase("")
    setDecryptedBlob(null)
    setDecryptedFileName("")
    setProgress(0)
    setShowInvalidFileError(false)
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
          <h3 className="font-semibold text-lg">Choose a file to decrypt</h3>
        </div>
        <FileUpload file={file} onFileSelect={setFile} disabled={isDecrypting || !!decryptedBlob} />
        {!file && (
          <div className="mt-6">
            <FeaturesPanel />
          </div>
        )}
      </div>

      {showInvalidFileError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-500">
                This file was not encrypted using SecureLock or the file may be corrupted!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please ensure you selected the correct file that was encrypted with SecureLock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Decryption Method */}
      {file && !decryptedBlob && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#36b3fd", color: "white" }}
            >
              2
            </div>
            <h3 className="font-semibold text-lg">Select decryption method</h3>
          </div>
          <div className="flex gap-3">
            <Button
              variant={decryptionMethod === "password" ? "default" : "outline"}
              onClick={() => setDecryptionMethod("password")}
              className="flex-1"
              disabled={isDecrypting}
            >
              Password
            </Button>
            <Button
              variant={decryptionMethod === "pgp" ? "default" : "outline"}
              onClick={() => setDecryptionMethod("pgp")}
              className="flex-1"
              disabled={isDecrypting}
            >
              PGP Key
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Enter Credentials */}
      {file && !decryptedBlob && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#36b3fd", color: "white" }}
            >
              3
            </div>
            <h3 className="font-semibold text-lg">
              {decryptionMethod === "password" ? "Enter password" : "Enter PGP private key"}
            </h3>
          </div>
          {decryptionMethod === "password" ? (
            <PasswordInput
              value={password}
              onChange={setPassword}
              disabled={isDecrypting}
              placeholder="Enter your password"
            />
          ) : (
            <div className="space-y-3">
              <PGPKeyInput
                value={pgpKey}
                onChange={setPgpKey}
                disabled={isDecrypting}
                placeholder="Paste your PGP private key here"
              />
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Private Key Passphrase (if encrypted)
                </label>
                <PasswordInput
                  value={pgpPassphrase}
                  onChange={setPgpPassphrase}
                  disabled={isDecrypting}
                  placeholder="Enter your private key passphrase (leave empty if not encrypted)"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Decrypt */}
      {file && !decryptedBlob && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#36b3fd", color: "white" }}
            >
              4
            </div>
            <h3 className="font-semibold text-lg">Decrypt file</h3>
          </div>
          <Button
            onClick={handleDecrypt}
            disabled={
              isDecrypting || (decryptionMethod === "password" && !password) || (decryptionMethod === "pgp" && !pgpKey)
            }
            className="w-full"
            size="lg"
          >
            <Key className="w-4 h-4 mr-2" />
            {isDecrypting ? `Decrypting... ${progress}%` : "Decrypt File"}
          </Button>
        </div>
      )}

      {/* Download Decrypted File */}
      {decryptedBlob && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-lg mb-1">✓ Decryption Complete</p>
              <p className="text-sm text-muted-foreground">Your file has been decrypted successfully</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownload} size="lg" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Decrypted File
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              Decrypt Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
