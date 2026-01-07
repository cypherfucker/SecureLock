"use client"

import { useState } from "react"
import { Shield, Lock, Key, Info, Github, Mail, KeyRound } from "lucide-react"
import { EncryptionTab } from "@/components/encryption-tab"
import { DecryptionTab } from "@/components/decryption-tab"
import { AboutDialog } from "@/components/about-dialog"
import Image from "next/image"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">("encrypt")
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="SecureLock Logo" width={32} height={32} className="w-8 h-8" />
            <div>
              <h1 className="font-bold text-xl">SecureLock</h1>
              <p className="text-xs text-muted-foreground">v2.3</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://pgp.cypherfucker.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              title="PGP Key Manager"
            >
              <Image src="/pgp-icon.png" alt="PGP Keys" width={28} height={28} className="w-7 h-7 rounded-full" />
            </a>
            <a
              href="https://github.com/cypherfucker/SecureLock/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-4 h-4" />
              About
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-3 text-balance">Secure File Encryption</h2>
          <div className="text-muted-foreground text-lg space-y-1">
            <p>Encrypt and decrypt any file locally</p>
            <p>No size or format limitation. No data ever leaves your device</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">100% Client-Side Processing</p>
            <p className="text-muted-foreground">
              All encryption and decryption happens in your browser. Files never leave your device. No data is
              transmitted to any server.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-muted rounded-lg p-1 flex gap-1 mb-8">
          <button
            onClick={() => setActiveTab("encrypt")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "encrypt"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Encryption
          </button>
          <button
            onClick={() => setActiveTab("decrypt")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "decrypt"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            Decryption
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-card border border-border rounded-lg p-8">
          {activeTab === "encrypt" ? <EncryptionTab /> : <DecryptionTab />}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground space-y-4">
          {/* Social/contact icons row */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.cypherfucker.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              title="GitHub"
            >
              <Github className="w-6 h-6" style={{ color: "#36b3fd" }} />
            </a>
            <a
              href="mailto:cypherfucker@cypherfucker.com?subject=PGP%2001F12D0E8BB91FBFDCCF0FCD689073ADCD1E9288"
              className="hover:opacity-70 transition-opacity"
              title="Email"
            >
              <Mail className="w-6 h-6" style={{ color: "#36b3fd" }} />
            </a>
            <a
              href="https://key.cypherfucker.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              title="PGP Keys"
            >
              <KeyRound className="w-6 h-6" style={{ color: "#36b3fd" }} />
            </a>
            <a
              href="https://open-collective.cypherfucker.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              title="Open Collective"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#36b3fd" strokeWidth="2" />
                <path
                  d="M15.5 7.5C16.88 8.88 16.88 11.12 15.5 12.5M15.5 16.5C18.26 13.74 18.26 9.26 15.5 6.5"
                  stroke="#36b3fd"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>

          <div className="space-y-2">
            <p>Free and Open Source - Privacy by design</p>
            <p>
              <a
                href="https://github.com/cypherfucker/SecureLock/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                style={{ color: "#36b3fd" }}
              >
                CC0
              </a>{" "}
              Public Domain - No Copyright Required
            </p>
          </div>
        </div>
      </main>

      {/* About Dialog */}
      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />
    </div>
  )
}
