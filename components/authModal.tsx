"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { SignIn } from "./signIn"
import { SignUp } from "./signUp"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "signin" | "signup"
}

export function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 relative max-h-[90vh] overflow-y-auto border border-[#cecbf6]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-[12px] hover:bg-[#f7f6fd] text-[#26215c] transition-[background-color,color] duration-300 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mt-4">
          {mode === "signin" ? (
            <SignIn
              onClose={onClose}
              onSignUp={() => setMode("signup")}
            />
          ) : (
            <SignUp
              onClose={onClose}
              onSignIn={() => setMode("signin")}
            />
          )}
        </div>
      </div>
    </div>
  )
}
