"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Heart } from "lucide-react"
import { getImageFromFirestore } from "@/lib/cloud-storage"
import { useAuth } from "@/lib/auth-context"
import { toggleSavedVenue } from "@/lib/firestore-users"
import { Skeleton } from "./ui/skeleton"

interface BrowseVenueCardProps {
  venue: {
    id: number | string
    nameKey: string
    locationKey: string
    price: number
    guests: number
    image: string
    premium?: boolean
    firestoreId?: string
  }
  resolveLabel: (key: string) => string
}

export function BrowseVenueCard({ venue, resolveLabel }: BrowseVenueCardProps) {
  const { user, userProfile, updateProfile } = useAuth()
  const [resolvedImage, setResolvedImage] = useState<string | null>(
    venue.image.startsWith("firestore://") ? null : venue.image
  )
  const [imageLoading, setImageLoading] = useState(venue.image.startsWith("firestore://"))
  
  const venueId = (venue.firestoreId || String(venue.id))
  const [isFavorited, setIsFavorited] = useState(() => {
    if (!userProfile?.savedVenueIds) return false
    return userProfile.savedVenueIds.includes(venueId)
  })

  // Sync with profile changes
  useEffect(() => {
    if (userProfile?.savedVenueIds) {
      setIsFavorited(userProfile.savedVenueIds.includes(venueId))
    }
  }, [userProfile?.savedVenueIds, venueId])

  const venueName = resolveLabel(venue.nameKey)
  const venueLocation = resolveLabel(venue.locationKey)

  const isHardcodedVenue = typeof venue.id === 'number' && venue.id >= 1 && venue.id <= 6
  const detailPageId = isHardcodedVenue ? venue.id : venue.firestoreId

  useEffect(() => {
    let isMounted = true

    async function resolveImage() {
      if (venue.image.startsWith("firestore://")) {
        try {
          const imageId = venue.image.replace("firestore://", "")
          const resolved = await getImageFromFirestore(imageId)
          if (isMounted && resolved) {
            setResolvedImage(resolved)
          }
        } catch (error) {
          console.error("Failed to resolve image:", error)
        } finally {
          if (isMounted) setImageLoading(false)
        }
      }
    }

    resolveImage()
    return () => { isMounted = false }
  }, [venue.image])

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) return // Could redirect to sign-in if desired
    
    const newSavedState = !isFavorited
    setIsFavorited(newSavedState)

    try {
      const { isSaved: serverState, updatedIds } = await toggleSavedVenue(user.uid, venueId)
      setIsFavorited(serverState)
      await updateProfile({ savedVenueIds: updatedIds })
    } catch (error) {
      console.error("Failed to save venue:", error)
      setIsFavorited(!newSavedState)
    }
  }

  return (
    <Link href={`/venues/${detailPageId}`} className="group block w-full outline-none focus-visible:ring-2 focus-visible:ring-[#26215c] rounded-[14px]">
      <div className="relative w-full rounded-[14px] overflow-hidden isolate">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#cecbf6] rounded-[14px]">
          {imageLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <Image
              src={resolvedImage || "/images/venues/default.jpg"}
              alt={venueName}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              loading="lazy"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          )}

          {/* Gradient Overlay for subtle text contrast if needed, but here we just use it for the badge/heart */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Premium Badge */}
          {venue.premium && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-white/90 backdrop-blur-md text-[#26215c] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                Premium
              </span>
            </div>
          )}

          {/* Favorite Heart */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 z-20 p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorited ? "fill-[#7f77dd] text-[#7f77dd]" : "text-white stroke-[1.5]"
              }`}
            />
          </button>
        </div>

        {/* Card Content - Minimalist Luxury */}
        <div className="pt-4 pb-2">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-bold text-[#26215c] mb-0.5 truncate tracking-tight">
                {venueName}
              </h3>
              <p className="text-[14px] text-[#534ab7] truncate">
                {venueLocation}
              </p>
              <p className="text-[14px] text-[#534ab7] mt-0.5">
                Up to {venue.guests} guests
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[16px] font-bold text-[#26215c]">₾{venue.price}</div>
              <div className="text-[13px] text-[#534ab7]">night</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function BrowseVenueCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-[4/3] w-full rounded-[14px]" />
      <div className="pt-4 pb-2 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}
