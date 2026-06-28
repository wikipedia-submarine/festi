"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getUserProfile, UserProfile } from "@/lib/firestore-users"
import { getUserVenues } from "@/lib/firestore-venues"
import { getHostReviews, FirestoreReview } from "@/lib/firestore-reviews"
import { getImageFromFirestore } from "@/lib/cloud-storage"
import { ArrowLeft, MapPin, Calendar, Mail, Edit3, Loader2, Star, User, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { FeaturedVenueCard } from "@/components/featuredVenueCard"
import { Header } from "@/components/header"

export default function PublicProfilePage() {
  const params = useParams()
  const uid = params.id as string
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [venues, setVenues] = useState<any[]>([])
  const [reviews, setReviews] = useState<FirestoreReview[]>([])
  const [loading, setLoading] = useState(true)
  const isOwner = user?.uid === uid

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch profile first
        const profileData = await getUserProfile(uid)
        setProfile(profileData)

        // Then try to fetch venues and reviews (don't let them block the profile)
        try {
          const userVenues = await getUserVenues(uid)
          
          // Resolve images for venues
          const resolvedVenues = await Promise.all(
            userVenues.map(async (v) => {
              let firstImg = v.images && v.images.length > 0 ? v.images[0] : (v.image || "")
              if (firstImg.startsWith("firestore://")) {
                try {
                  const imageId = firstImg.replace("firestore://", "")
                  const resolved = await getImageFromFirestore(imageId)
                  if (resolved) firstImg = resolved
                } catch (e) {
                  console.error("Error resolving venue image:", e)
                }
              }
              return { ...v, resolvedImage: firstImg }
            })
          )
          
          setVenues(resolvedVenues)
          
          // Infer name if it's still default
          if (profileData.displayName === "User" && userVenues.length > 0) {
            setProfile(prev => prev ? { ...prev, displayName: userVenues[0].submittedBy || "User" } : prev)
          }
        } catch (vError: any) {
          console.error("Error loading venues:", vError)
          // If it's a permission error, we just keep venues empty rather than crashing
          if (vError.code === "permission-denied") {
            setVenues([])
          }
        }

        try {
          const userReviews = await getHostReviews(uid)
          setReviews(userReviews)
        } catch (rError: any) {
          console.error("Error loading reviews:", rError)
          if (rError.code === "permission-denied") {
            setReviews([])
          }
        }

      } catch (error) {
        console.error("Critical error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }
    if (uid) loadData()
  }, [uid])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">User not found</h1>
        <p className="text-muted-foreground mb-8">The profile you are looking for does not exist or could not be loaded.</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-black transition-colors">
          Go back home
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f6fd] relative font-sans">
      <Header />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-apple-blue/10 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <div className="pt-[104px] px-6 md:px-12 max-w-[1400px] mx-auto pb-20 relative z-10">
        <div className="flex items-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#26215c]">User Profile</h1>
        </div>

        <div className="flex flex-col gap-10">
          {/* Top Section: Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <div className="md:col-span-5 lg:col-span-4 p-8 rounded-[14px] bg-white border border-[#cecbf6] shadow-[0_4px_24px_rgba(107,122,144,0.04)] flex flex-col items-center text-center">
              <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border border-[#cecbf6] shadow-sm">
                {profile.profileImage ? (
                  <Image src={profile.profileImage} alt={profile.displayName || "User"} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#26215c] flex items-center justify-center text-white font-bold text-3xl">
                    {(profile.displayName || "User").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-extrabold text-[#26215c] tracking-tight mb-1">
                {profile.displayName || "Anonymous User"}
              </h2>
              <p className="text-[13px] text-[#534ab7] font-medium mb-6">
                Member since {profile.createdAt ? format(profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt), "MMMM yyyy") : "recently"}
              </p>

              <div className="w-full flex flex-col gap-3 text-[14px] text-[#534ab7] mb-6">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location || "Earth"}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{profile.email}</span>
                </div>
              </div>

              {isOwner && (
                <Link 
                  href="/profile/edit"
                  className="w-full mt-auto py-3 rounded-[12px] bg-white text-[#26215c] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#f7f6fd] transition-all border border-[#cecbf6] shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Link>
              )}
            </div>

            <div className="md:col-span-7 lg:col-span-8 h-full">
              <div className="p-8 rounded-[14px] bg-white border border-[#cecbf6] shadow-[0_4px_24px_rgba(107,122,144,0.04)] h-full flex flex-col">
                <h3 className="font-extrabold text-[#26215c] mb-4 text-xl">About Me</h3>
                <p className="text-[#534ab7] leading-relaxed text-[15px] whitespace-pre-wrap">
                  {profile.bio || "No bio added yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Content: Spaces & Reviews */}
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-extrabold text-[#26215c] tracking-tight mb-6">
                {profile.displayName?.split(' ')[0]}'s Spaces
              </h2>
              {venues.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Pinned Venues First */}
                  {[...venues]
                    .sort((a, b) => {
                      const aPinned = profile?.pinnedVenueIds?.includes(a.id) ? 1 : 0
                      const bPinned = profile?.pinnedVenueIds?.includes(b.id) ? 1 : 0
                      return bPinned - aPinned
                    })
                    .map((venue) => {
                      const isPinned = profile?.pinnedVenueIds?.includes(venue.id)
                      return (
                        <div key={venue.id} className="relative">
                          {isPinned && (
                            <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-[#26215c] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                              Pinned
                            </div>
                          )}
                          <FeaturedVenueCard
                            id={venue.id as string}
                            title={venue.spaceName || venue.nameKey || "Venue"}
                            location={venue.location || "Location"}
                            price={venue.price || 0}
                            image={venue.resolvedImage || "/images/venues/default.jpg"}
                            isPopular={false}
                            isGeorgian={false}
                          />
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="p-12 rounded-[14px] border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">No venues listed yet.</p>
                </div>
              )}
            </div>

            {/* Host Reviews */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-[#26215c] tracking-tight">Guest Reviews</h2>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f7f6fd] text-[#26215c] font-bold text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-8 rounded-[14px] bg-white border border-[#cecbf6] shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#f7f6fd] flex items-center justify-center overflow-hidden border border-[#cecbf6]">
                            {review.reviewerImage ? (
                              <img src={review.reviewerImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#26215c] flex items-center justify-center text-white font-bold text-sm">
                                {(review.reviewerName || "User").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#26215c]">{review.reviewerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {review.createdAt ? format(review.createdAt.toDate ? review.createdAt.toDate() : new Date(review.createdAt), "MMM d, yyyy") : "Recently"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic">
                        &quot;{review.comment}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 rounded-[14px] border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-medium">No reviews yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">Reviews from guests will appear here after their stay.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
