"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { getImageFromFirestore } from "@/lib/cloud-storage"

export interface FeaturedVenueCardProps {
  id: string | number
  image: string
  isPopular: boolean
  title: string
  titleKa?: string
  location: string
  locationKa?: string
  price: number
  isGeorgian: boolean
  className?: string
  variant?: "default" | "compact"
}

export function FeaturedVenueCard({
  id,
  image,
  isPopular,
  title,
  titleKa,
  location,
  locationKa,
  price,
  isGeorgian,
  className = "",
  variant = "default",
}: FeaturedVenueCardProps) {
  const [resolvedImage, setResolvedImage] = useState<string | null>(
    image.startsWith("firestore://") ? null : image
  )
  const [imageLoading, setImageLoading] = useState(image.startsWith("firestore://"))

  useEffect(() => {
    let isMounted = true
    
    async function resolveImage() {
      if (image.startsWith("firestore://")) {
        try {
          const imageId = image.replace("firestore://", "")
          const resolved = await getImageFromFirestore(imageId)
          if (isMounted && resolved) {
            setResolvedImage(resolved)
          }
        } catch (error) {
          console.error("Failed to resolve image:", error)
        } finally {
          if (isMounted) setImageLoading(false)
        }
      } else {
        if (isMounted) {
          setResolvedImage(image)
          setImageLoading(false)
        }
      }
    }

    resolveImage()
    return () => { isMounted = false }
  }, [image])

  const bgImage = resolvedImage && resolvedImage.trim() !== "" ? resolvedImage : "/images/venues/garden-villa.jpg"

  const isHousesCard = className.includes("houses-card")

  return (
    <Link
      href={`/venues/${id}`}
      className={`group relative aspect-[3/2] overflow-hidden flex flex-col justify-between cursor-pointer isolate transition-shadow duration-300 ease-out ${!isHousesCard ? `rounded-[14px] shadow-[0_4px_20px_rgba(107,122,144,0.08)] hover:shadow-[0_16px_48px_rgba(107,122,144,0.16)] ${variant === "compact" ? "p-4 md:p-5" : "p-6 md:p-8"}` : ''} ${className}`}
    >
      {imageLoading ? (
        <div className={`absolute -z-20 bg-[#cecbf6] animate-pulse ${isHousesCard ? 'inset-[8px] rounded-[8px]' : 'inset-0'}`} />
      ) : (
        <div
          className={`absolute -z-20 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 ${isHousesCard ? 'inset-[8px] rounded-[8px]' : 'inset-0'}`}
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      <div className={`absolute -z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-40 ${isHousesCard ? 'inset-[8px] rounded-[8px]' : 'inset-0'}`} />

      <div className="relative z-10 flex justify-between">
        {isPopular ? (
          <div className={`bg-black/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${isGeorgian ? "font-georgian" : ""}`}>
            {isGeorgian ? "პოპულარული" : "Popular"}
          </div>
        ) : (
          <div />
        )}
      </div>

      <div className="relative z-10 flex flex-col items-start">
        <h3
          className={`text-white font-bold ${variant === "compact" ? "text-[20px] md:text-[22px] mb-0.5" : "text-[26px] md:text-[30px] mb-1"} leading-tight tracking-tight truncate w-full ${isGeorgian ? "font-georgian" : ""}`}
          style={variant === "default" ? { textShadow: "0 2px 12px rgba(120, 110, 255, 0.25), 0 1px 4px rgba(0,0,0,0.4)" } : { textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          {isGeorgian && titleKa ? titleKa : title}
        </h3>

        <div className={`flex items-center ${variant === "compact" ? "gap-1 mb-1.5 text-[12px] text-white/80" : "gap-1.5 mb-3 text-[13px] text-[#d4d0ff]"} w-full`}>
          <MapPin className={`${variant === "compact" ? "w-3 h-3 flex-shrink-0" : "w-3.5 h-3.5 flex-shrink-0"}`} />
          <span className={`truncate ${isGeorgian ? "font-georgian" : ""}`}>{isGeorgian && locationKa ? locationKa : location}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span
            className={`font-bold ${variant === "compact" ? "text-lg md:text-xl text-white" : "text-xl md:text-2xl text-[#f0eeff]"}`}
          >
            ${price}
          </span>
          <span className={`text-white/60 uppercase ${variant === "compact" ? "text-[10px]" : "text-[12px]"} ${isGeorgian ? "font-georgian" : ""}`}>
            / {isGeorgian ? "ღამე" : "night"}
          </span>
        </div>
      </div>
    </Link>
  )
}
