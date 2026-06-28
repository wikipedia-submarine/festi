"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { ArrowLeft, Mail, Lock, User } from "lucide-react"

interface SignUpProps {
  onClose?: () => void
  onSignIn?: () => void
}

export function SignUp({ onClose, onSignIn }: SignUpProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [step, setStep] = useState<"form" | "verify">("form")
  const { signUp } = useAuth()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, name)
      setStep("verify")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
      setLoading(false)
    }
  }

  if (step === "verify") {
    return (
      <div className="w-full max-w-md">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-[#26215c]">Check your email</h1>
            <p className="text-center text-[#534ab7]">We've sent a verification link to <span className="font-semibold">{email}</span>. Please click the link to verify your account.</p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-[12px] bg-[#26215c] text-white font-bold cursor-pointer hover:bg-black transition-colors duration-300"
          >
            Got it
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-[#26215c]">Create Account</h1>
          <p className="text-center text-[#534ab7]">Join FESTIVO today</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="name" className="block text-[#26215c] font-semibold">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#534ab7]" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 rounded-[12px] border border-[#cecbf6] bg-[#f7f6fd] text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] transition-[box-shadow,border-color,background-color] duration-300"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="email" className="block text-[#26215c] font-semibold">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#534ab7]" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-[12px] border border-[#cecbf6] bg-[#f7f6fd] text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] transition-[box-shadow,border-color,background-color] duration-300"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="password" className="block text-[#26215c] font-semibold">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#534ab7]" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-[12px] border border-[#cecbf6] bg-[#f7f6fd] text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] transition-[box-shadow,border-color,background-color] duration-300"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#534ab7] hover:text-[#26215c] transition-colors text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="confirmPassword" className="block text-[#26215c] font-semibold">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#534ab7]" />
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-[12px] border border-[#cecbf6] bg-[#f7f6fd] text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] transition-[box-shadow,border-color,background-color] duration-300"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-apple-red/10 border border-apple-red/30 flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-apple-red/20 flex-shrink-0 mt-0.5">
                <span className="w-4 h-4 text-apple-red">!</span>
              </div>
              <p className="text-sm font-medium text-apple-red">{error}</p>
            </div>
          )}

          <div className="flex items-start gap-3 py-1">
            <input 
              type="checkbox" 
              id="signup-agreement" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[#cecbf6] text-[#26215c] focus:ring-[#26215c] cursor-pointer shrink-0"
            />
            <label htmlFor="signup-agreement" className="text-[12px] text-[#534ab7] leading-relaxed cursor-pointer select-none">
              I agree to Festivo's <Link href="/terms" className="text-[#26215c] font-semibold hover:underline">Terms of Use</Link>, <Link href="/privacy" className="text-[#26215c] font-semibold hover:underline">Privacy Policy</Link>, and <Link href="/refunds" className="text-[#26215c] font-semibold hover:underline">Refund Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full py-3 px-6 rounded-[12px] bg-[#26215c] text-white font-bold cursor-pointer hover:bg-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending code..." : "Continue"}
          </button>
        </form>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#cecbf6]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#534ab7]">Already have an account?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignIn}
            className="w-full py-3 px-6 rounded-[12px] border border-[#cecbf6] hover:bg-[#f7f6fd] text-[#26215c] font-semibold cursor-pointer transition-colors duration-300"
          >
            Sign In
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-[12px] bg-white border border-[#cecbf6] text-[#26215c] font-semibold cursor-pointer hover:bg-[#f7f6fd] transition-colors duration-300 flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        )}
      </div>
    </div>
  )
}
