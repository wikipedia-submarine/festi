"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { FeaturedVenueCard } from "./featuredVenueCard"
import { useLanguage } from "@/lib/language-context"

const FEATURED_VENUES = [
  {
    id: "1",
    title: "Skyline Penthouse",
    titleKa: "სქაილაინ პენტჰაუსი",
    location: "Tbilisi",
    locationKa: "თბილისი",
    price: 450,
    image: "/images/venues/skyline-penthouse.jpg",
    isPopular: true,
  },
  {
    id: "2",
    title: "Garden Villa",
    titleKa: "ბაღის ვილა",
    location: "Tbilisi",
    locationKa: "თბილისი",
    price: 380,
    image: "/images/venues/garden-villa.jpg",
    isPopular: false,
  },
  {
    id: "3",
    title: "Sunset Rooftop",
    titleKa: "მზის ჩასვლის ტერასა",
    location: "Batumi",
    locationKa: "ბათუმი",
    price: 220,
    image: "/images/venues/rooftop-terrace.jpg",
    isPopular: false,
  },
  {
    id: "4",
    title: "Light Studio",
    titleKa: "ლაით სტუდია",
    location: "Tbilisi",
    locationKa: "თბილისი",
    price: 280,
    image: "/images/venues/loft-studio.jpg",
    isPopular: false,
  },
  {
    id: "5",
    title: "Seaside Villa",
    titleKa: "ზღვისპირა ვილა",
    location: "Batumi",
    locationKa: "ბათუმი",
    price: 520,
    image: "/images/venues/seaside-villa.jpg",
    isPopular: true,
  },
  {
    id: "6",
    title: "Mountain Retreat",
    titleKa: "მთის თავშესაფარი",
    location: "Borjomi",
    locationKa: "ბორჯომი",
    price: 340,
    image: "/images/venues/mountain-retreat.jpg",
    isPopular: false,
  },
]

export function FeaturedVenuesGrid() {
  const { language } = useLanguage()
  const isGeorgian = language === "ka"

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      )
    }
  }

  useEffect(() => {
    checkScrollability()
    window.addEventListener("resize", checkScrollability)
    return () => window.removeEventListener("resize", checkScrollability)
  }, [])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = container.clientWidth * 0.7
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (<section className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-6 md:pt-8 pb-4 md:pb-6">


    <div className="flex items-end justify-between mb-8">
      <h2 className="text-[#26215c] text-[26px] md:text-[32px] font-bold tracking-tight">
        {isGeorgian ? "რჩეული სივრცეები" : "Featured venues"}
      </h2>
      
      <div className="hidden md:flex items-center gap-3">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`h-10 w-10 flex items-center justify-center transition-all duration-75 rounded-full border border-[#cecbf6] bg-[#f7f6fd] shadow-sm group ${canScrollLeft
            ? "opacity-100 hover:bg-[#26215c] hover:border-[#26215c] hover:scale-105 hover:shadow-md cursor-pointer"
            : "opacity-40 cursor-not-allowed"
            }`}
        >
          <ChevronLeft className="w-5 h-5 text-[#534ab7] group-hover:text-white transition-colors duration-75 ml-[-2px]" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`h-10 w-10 flex items-center justify-center transition-all duration-75 rounded-full border border-[#cecbf6] bg-[#f7f6fd] shadow-sm group ${canScrollRight
            ? "opacity-100 hover:bg-[#26215c] hover:border-[#26215c] hover:scale-105 hover:shadow-md cursor-pointer"
            : "opacity-40 cursor-not-allowed"
            }`}
        >
          <ChevronRight className="w-5 h-5 text-[#534ab7] group-hover:text-white transition-colors duration-75 mr-[-2px]" />
        </button>
      </div>
    </div>

    <div className="relative">



      {/* SCROLL */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
      >
        {FEATURED_VENUES.map((venue) => (
          <FeaturedVenueCard
            key={venue.id}
            id={venue.id}
            image={venue.image}
            isPopular={venue.isPopular}
            title={venue.title}
            titleKa={venue.titleKa}
            location={venue.location}
            locationKa={venue.locationKa}
            price={venue.price}
            isGeorgian={isGeorgian}
            className="flex-shrink-0 w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center"
          />
        ))}
      </div>

    </div>
  </section>


  )
}
