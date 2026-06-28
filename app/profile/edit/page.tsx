"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/firestore-users"
import { getUserVenues } from "@/lib/firestore-venues"
import { ArrowLeft, Save, Loader2, Camera, MapPin, User, Info, Star, Pin, CheckCircle2, ChevronRight, Layout } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { Header } from "@/components/header"
import { ProfileSidebar } from "@/components/profileSidebar"

type Section = "basic" | "pinned"

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>("basic")

  useEffect(() => {
    async function loadData() {
      if (!user) {
        if (!authLoading) router.push("/sign-in")
        return
      }
      try {
        const [profileData, userVenues] = await Promise.all([
          getUserProfile(user.uid),
          getUserVenues(user.uid)
        ])
        
        console.log("Loaded Profile:", profileData)
        console.log("Loaded Venues:", userVenues)
        
        setProfile(profileData)
        setVenues(userVenues)
      } catch (error) {
        console.error("Error loading profile:", error)
        toast.error("Error loading profile data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, authLoading, router])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateUserProfile(user.uid, profile)
      toast.success("Changes saved successfully!")
      router.push(`/profile/${user.uid}`)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const togglePin = (venueId: string) => {
    const currentPinned = profile.pinnedVenueIds || []
    if (currentPinned.includes(venueId)) {
      setProfile({ ...profile, pinnedVenueIds: currentPinned.filter(id => id !== venueId) })
    } else {
      if (currentPinned.length >= 3) {
        toast.error("You can only pin up to 3 venues")
        return
      }
      setProfile({ ...profile, pinnedVenueIds: [...currentPinned, venueId] })
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Connecting to database...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f6fd] font-sans">
      <Header />
      <div className="pt-[104px] px-6 md:px-12 max-w-[1400px] mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1 hidden lg:block">
            <ProfileSidebar />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-[#26215c]">Edit Profile</h1>
                <p className="text-[14px] text-[#534ab7] mt-1">Manage your public identity and pinned content</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push(`/profile/${user?.uid}`)}
                  className="px-6 py-3 rounded-[12px] bg-white text-[#26215c] font-bold hover:bg-[#f7f6fd] transition-all border border-[#cecbf6] shadow-sm text-[14px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3 rounded-[12px] bg-[#26215c] text-white font-bold hover:bg-black transition-all shadow-md disabled:opacity-50 text-[14px]"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>

            {/* Inline Tabs */}
            <div className="flex gap-2 p-1 bg-white border border-[#cecbf6] rounded-[14px] w-fit shadow-sm">
              <button 
                onClick={() => setActiveSection("basic")}
                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[14px] font-bold transition-all ${
                  activeSection === "basic" ? "bg-[#26215c] text-white" : "text-[#534ab7] hover:bg-[#f7f6fd] hover:text-[#26215c]"
                }`}
              >
                <User className="w-4 h-4" />
                Personal Info
              </button>
              <button 
                onClick={() => setActiveSection("pinned")}
                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[14px] font-bold transition-all ${
                  activeSection === "pinned" ? "bg-[#26215c] text-white" : "text-[#534ab7] hover:bg-[#f7f6fd] hover:text-[#26215c]"
                }`}
              >
                <Pin className="w-4 h-4" />
                Pinned Venues
              </button>
            </div>

            {activeSection === "basic" ? (
              <div className="p-8 rounded-[14px] bg-white border border-[#cecbf6] shadow-[0_4px_24px_rgba(107,122,144,0.04)] space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 rounded-full overflow-hidden border border-[#cecbf6] shadow-sm bg-[#f7f6fd]">
                      {profile.profileImage ? (
                        <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#26215c] flex items-center justify-center text-white font-bold text-4xl">
                          {(profile.displayName || "User").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-[#26215c]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-[#26215c]">Profile Picture</h3>
                    <p className="text-[13px] text-[#534ab7] max-w-sm">
                      Upload a photo so hosts and guests can recognize you.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-[#cecbf6]">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#534ab7] uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      value={profile.displayName || ""}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      className="w-full px-4 py-3 rounded-[10px] bg-[#f7f6fd] border border-[#cecbf6] focus:border-[#26215c] focus:ring-1 focus:ring-[#26215c] transition-all outline-none text-[#26215c] font-medium text-[15px]"
                      placeholder="Enter your real name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#534ab7] uppercase tracking-wide">Current City</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#534ab7]" />
                      <input
                        type="text"
                        value={profile.location || ""}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-[10px] bg-[#f7f6fd] border border-[#cecbf6] focus:border-[#26215c] focus:ring-1 focus:ring-[#26215c] transition-all outline-none text-[#26215c] font-medium text-[15px]"
                        placeholder="e.g. Tbilisi, Georgia"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#534ab7] uppercase tracking-wide">Bio / Story</label>
                  <textarea
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full h-32 px-4 py-3 rounded-[10px] bg-[#f7f6fd] border border-[#cecbf6] focus:border-[#26215c] focus:ring-1 focus:ring-[#26215c] transition-all outline-none text-[#26215c] font-medium text-[15px] resize-none leading-relaxed"
                    placeholder="Share your passion for hosting..."
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-[14px] bg-white border border-[#cecbf6] shadow-[0_4px_24px_rgba(107,122,144,0.04)] space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#26215c]">Pinned Venues</h3>
                    <p className="text-[14px] text-[#534ab7] mt-1">Select up to 3 spaces to display prominently.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#f7f6fd] flex items-center justify-center text-[#26215c]">
                    <Pin className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venues.map((v) => {
                    const isPinned = profile.pinnedVenueIds?.includes(v.id)
                    const imageSrc = (v.images && v.images.length > 0) ? v.images[0] : (v.image || "/images/venues/default.jpg")
                    
                    return (
                      <button
                        key={v.id}
                        onClick={() => togglePin(v.id)}
                        className={`group relative p-4 rounded-[14px] border transition-all text-left flex items-center gap-4 overflow-hidden ${
                          isPinned 
                            ? "border-[#26215c] bg-[#26215c]/5" 
                            : "border-[#cecbf6] bg-white hover:border-[#26215c]/40 hover:bg-[#f7f6fd]"
                        }`}
                      >
                        <div className="w-20 h-20 rounded-[10px] overflow-hidden flex-shrink-0 shadow-sm bg-[#f7f6fd]">
                          <img 
                            src={imageSrc === "/images/venues/default.jpg" ? "/images/venues/skyline-penthouse.jpg" : imageSrc} 
                            alt={v.spaceName || v.nameKey} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/venues/skyline-penthouse.jpg"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <p className="font-extrabold text-[#26215c] text-[15px] truncate">{v.spaceName || v.nameKey}</p>
                          <p className="text-[12px] font-medium text-[#534ab7] flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3 h-3" />
                            {v.location}
                          </p>
                        </div>
                        
                        <div className={`absolute top-1/2 -translate-y-1/2 right-4 transition-all ${isPinned ? "text-[#26215c]" : "text-[#534ab7] opacity-0 group-hover:opacity-100"}`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </button>
                    )
                  })}
                  {venues.length === 0 && (
                    <div className="col-span-1 md:col-span-2 py-16 text-center border border-dashed border-[#cecbf6] rounded-[14px] bg-[#f7f6fd]">
                      <Layout className="w-8 h-8 text-[#534ab7] mx-auto mb-3" />
                      <h4 className="font-bold text-[#26215c]">No venues found</h4>
                      <p className="text-[14px] text-[#534ab7] mt-1">Once you list a space, it will appear here.</p>
                      <Link href="/list-your-space" className="text-[#26215c] text-[13px] font-bold mt-4 inline-block hover:underline">List a venue now →</Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
