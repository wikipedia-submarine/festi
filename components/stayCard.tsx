"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"

export interface StayCardData {
  id: number | string
  title: string
  location: string
  price: number
  image: string
  rating: number
  reviews: number
  badge?: string
  badgeColor?: string
}

export function StayCard({ stay }: { stay: StayCardData }) {
  const [isFavorited, setIsFavorited] = useState(false)

  // Badge color mapping to match reference
  const getBadgeClasses = (badge?: string) => {
    switch (badge) {
      case "Villa":
        return "bg-[#26215c] text-white"
      case "Apartment":
        return "bg-[#26215c] text-white"
      case "Beachfront":
        return "bg-[#0d9488] text-white"
      case "Cabin":
        return "bg-[#633806] text-white"
      default:
        return "bg-[#26215c] text-white"
    }
  }

  return (
    <Link href={`/venues/${stay.id}`} className="group block w-full">
      <div className="relative w-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f7f6fd]">
          <Image
            src={stay.image}
            alt={stay.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          />

          {/* Badge */}
          {stay.badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${getBadgeClasses(stay.badge)}`}>
                {stay.badge}
              </span>
            </div>
          )}

          {/* Heart */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsFavorited(!isFavorited)
            }}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorited ? "fill-[#26215c] text-[#26215c]" : "text-[#26215c] stroke-[1.5]"
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="pt-3 pb-1">
          {/* Title + Rating */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="text-[14px] font-bold text-[#26215c] leading-tight truncate">
              {stay.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#26215c] text-[#26215c]" />
              <span className="text-[13px] font-bold text-[#26215c]">{stay.rating.toFixed(2)}</span>
              <span className="text-[13px] text-[#534ab7]">({stay.reviews})</span>
            </div>
          </div>

          {/* Location */}
          <p className="text-[13px] text-[#534ab7] mb-2">{stay.location}</p>

          {/* Bottom Rating row + Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#afa9ec] stroke-[2]" />
              <span className="text-[13px] text-[#534ab7]">{stay.rating.toFixed(2)}</span>
              <span className="text-[13px] text-[#534ab7]">({Math.floor(stay.reviews * 0.3)})</span>
            </div>
            <p className="text-[13px] text-[#534ab7]">
              From <span className="font-bold text-[#26215c]">₾{stay.price}</span> / night
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
