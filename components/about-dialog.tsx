"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Shield, Lock, Zap, Github } from "lucide-react"

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            About SecureLock
          </DialogTitle>
          <DialogDescription>Privacy-first file encryption tool</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-semibold mb-2">What is SecureLock?</h3>
            <p className="text-sm text-muted-foreground">
              SecureLock is a lightweight, client-side file encryption tool that allows you to encrypt and decrypt files
              of any type and size directly in your browser. Your files never leave your device, ensuring maximum
              privacy and security.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Client-Side Only</h4>
                <p className="text-sm text-muted-foreground">
                  All encryption and decryption happens locally in your browser. No data is ever transmitted to any
                  server.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Strong Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  Uses XChaCha20-Poly1305 encryption with Argon2id key derivation for password-based encryption, and
                  OpenPGP for public key encryption.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">No Size Limits</h4>
                <p className="text-sm text-muted-foreground">
                  Encrypt files of any size using chunked processing for efficient memory usage, even with large videos
                  and archives.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Technical Details</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>XChaCha20-Poly1305 authenticated encryption algorithm</li>
              <li>Argon2id password hashing for secure key derivation</li>
              <li>libsodium library for all cryptographic operations</li>
              <li>OpenPGP.js for PGP encryption and decryption</li>
              <li>Chunked file processing for large files with streaming encryption</li>
            </ul>
          </div>

          <div className="border-t pt-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">Built with privacy and security as top priorities</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
