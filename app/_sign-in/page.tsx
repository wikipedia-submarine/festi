"use client"
 
 import { useState } from "react"
 import Link from "next/link"
 import { useRouter } from "next/navigation"
 import { useAuth } from "@/lib/auth-context"
 import { LanguageSwitcher } from "@/components/languageSwitcher"
 import { motion } from "framer-motion"
 
 export default function SignInPage() {
   const router = useRouter()
   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")
   const [error, setError] = useState("")
   const [loading, setLoading] = useState(false)
   const { signIn } = useAuth()
 
   const handleSignIn = async (e: React.FormEvent) => {
     e.preventDefault()
     setError("")
     setLoading(true)
 
     try {
       await signIn(email, password)
       setTimeout(() => {
         router.push("/")
       }, 300)
     } catch (err: any) {
       setError(err.message || "Failed to sign in")
       setLoading(false)
     }
   }
 
   return (
    <main className="min-h-screen bg-[#f7f6fd] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#534ab7]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#534ab7]/5 blur-[100px]" />
      </div>
 
       <div className="w-full max-w-[460px] relative z-10">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
           className="bg-white border border-[#26215c]/5 rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
         >
         <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#26215c]/5">
             <Link href="/">
               <h1 className="text-xl font-black tracking-tighter text-[#26215c] uppercase">FESTIVO</h1>
             </Link>
             <LanguageSwitcher variant="auth" />
           </div>

           <div className="mb-8 text-center">
             <h2 className="text-2xl font-bold text-[#26215c] tracking-tight mb-1">Welcome back</h2>
             <p className="text-sm text-[#26215c]/40 font-medium">Please enter your account details</p>
           </div>
 
           <form onSubmit={handleSignIn} className="space-y-5">
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-[#26215c]/40 uppercase tracking-[0.2em] ml-1">Email Address</label>
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="your@email.com"
                 className="w-full px-5 py-3.5 rounded-xl border border-[#26215c]/10 bg-white text-[#26215c] placeholder:text-[#26215c]/20 focus:outline-none focus:ring-4 focus:ring-[#534ab7]/10 focus:border-[#534ab7]/40 transition-all duration-300 font-medium text-sm"
                 required
               />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold text-[#26215c]/40 uppercase tracking-[0.2em] ml-1">Password</label>
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Your password"
                 className="w-full px-5 py-3.5 rounded-xl border border-[#26215c]/10 bg-white text-[#26215c] placeholder:text-[#26215c]/20 focus:outline-none focus:ring-4 focus:ring-[#534ab7]/10 focus:border-[#534ab7]/40 transition-all duration-300 font-medium text-sm"
                 required
               />
               <div className="flex justify-end px-1">
                 <Link href="#" className="text-[10px] font-bold text-[#534ab7] hover:underline underline-offset-4 tracking-tight">
                   Forgot password?
                 </Link>
               </div>
             </div>
 
             {error && (
               <div className="p-3 rounded-lg bg-red-500/5 text-red-500 text-xs font-bold text-center">
                 {error}
               </div>
             )}
 
             <button
               type="submit"
               disabled={loading}
               className="w-full py-4 px-6 rounded-xl bg-[#26215c] text-white font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-black/5"
             >
               {loading ? "Signing in..." : "Sign In"}
             </button>
           </form>

           <div className="mt-8 pt-8 border-t border-[#26215c]/5 text-center">
             <p className="text-[#26215c]/40 font-bold text-xs">
               Don&apos;t have an account?{" "}
               <Link href="/sign-up" className="text-[#534ab7] hover:underline ml-1">Create one</Link>
             </p>
           </div>
         </motion.div>
       </div>
     </main>
   )
 }
