"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Users, Heart, Loader2, Grid2X2, List, ChevronDown, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { getVenuesByIds, type FirestoreVenue } from "@/lib/firestore-venues"
import { getImageFromFirestore } from "@/lib/cloud-storage"
import { Header } from "@/components/header"
import { ProfileSidebar } from "@/components/profileSidebar"
import { FeaturedVenueCard } from "@/components/featuredVenueCard"

export default function SavedVenuesPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [savedVenues, setSavedVenues] = useState<FirestoreVenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSavedVenues() {
      if (!userProfile?.savedVenueIds || userProfile.savedVenueIds.length === 0) {
        setSavedVenues([])
        setLoading(false)
        return
      }

      try {
        const venues = await getVenuesByIds(userProfile.savedVenueIds)
        
        // Resolve images for each venue
        const venuesWithResolvedImages = await Promise.all(
          venues.map(async (venue) => {
            if (venue.images && venue.images[0]?.startsWith("firestore://")) {
              try {
                const imageId = venue.images[0].replace("firestore://", "")
                const resolvedUrl = await getImageFromFirestore(imageId)
                if (resolvedUrl) {
                  return { ...venue, images: [resolvedUrl, ...venue.images.slice(1)] }
                }
              } catch (e) {
                console.error("Error resolving image", e)
              }
            }
            return venue
          })
        )
        
        setSavedVenues(venuesWithResolvedImages)
      } catch (error) {
        console.error("Error fetching saved venues:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchSavedVenues()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, userProfile?.savedVenueIds, authLoading])

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-[#f7f6fd] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#26215c]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f6fd] pt-32 px-6 flex flex-col items-center justify-center text-center">
        <Header />
        <Heart className="w-16 h-16 text-[#534ab7]/30 mb-6" />
        <h1 className="text-3xl font-extrabold text-[#26215c] mb-4">Please sign in</h1>
        <p className="text-[#534ab7] mb-8 max-w-md">
          You need to be signed in to view your saved venues.
        </p>
        <Link 
          href="/sign-in" 
          className="px-8 py-3 bg-[#26215c] text-white rounded-full font-bold hover:bg-black transition-all"
        >
          Sign In
        </Link>
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

          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h1 className="text-3xl font-extrabold text-[#26215c]">Saved Venues</h1>
              <div className="flex items-center gap-4">
                <div className="flex p-1 rounded-[12px] bg-white border border-[#cecbf6] shadow-sm w-fit">
                  <button className="p-2 rounded-[8px] bg-[#f7f6fd] text-[#26215c]">
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-[8px] text-[#534ab7] hover:text-[#26215c] transition-colors">
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

        {/* Venue Grid */}
        {savedVenues.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[24px] border border-[#cecbf6] shadow-[0_4px_24px_rgba(107,122,144,0.04)]">
            <Heart className="w-12 h-12 text-[#cecbf6] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold text-[#26215c] mb-2">No saved venues yet</h2>
            <p className="text-[#534ab7] text-[14px] mb-8 max-w-sm mx-auto">
              Explore our amazing spaces and click the heart icon to save them for later.
            </p>
            <Link 
              href="/browse" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#26215c] text-white rounded-[12px] text-[14px] font-bold hover:bg-black transition-all"
            >
              Browse Spaces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedVenues.map((venue) => {
              const venueName = typeof venue.spaceName === 'string' && venue.spaceName in t.venueData
                ? t.venueData[venue.spaceName as keyof typeof t.venueData]
                : venue.spaceName
              
              const venueLocation = typeof venue.location === 'string' && venue.location in t.venueData
                ? t.venueData[venue.location as keyof typeof t.venueData]
                : venue.location

              return (
                <FeaturedVenueCard
                  key={venue.id}
                  id={venue.id as string}
                  title={venueName}
                  location={venueLocation}
                  price={venue.price}
                  image={venue.images?.[0] || "/images/venues/default.jpg"}
                  isPopular={false}
                  isGeorgian={false}
                />
              )
            })}
          </div>
        )}

        {/* Footer CTA */}
        {savedVenues.length > 0 && (
          <div className="py-20 flex flex-col items-center text-center">
            <Heart className="w-6 h-6 text-[#cecbf6] mb-4" />
            <h3 className="text-[14px] font-bold text-[#26215c]">
              Can't find a venue you saved?
            </h3>
            <p className="text-[13px] text-[#534ab7] mt-1 mb-6">
              Explore more amazing spaces for your next event.
            </p>
            <Link 
              href="/browse" 
              className="px-6 py-3 rounded-[14px] bg-[#26215c] text-white text-[13px] font-bold hover:bg-black transition-colors shadow-[0_4px_14px_rgba(17,17,17,0.15)]"
            >
              Browse venues
            </Link>
          </div>
        )}
          </div>
        </div>
      </div>
    </main>
  )
}
