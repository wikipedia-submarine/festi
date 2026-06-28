"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BrowseVenueCard } from "@/components/browseVenueCard"
import { staticVenuesData } from "@/lib/static-venues"
import { useLanguage } from "@/lib/language-context"
import { SlidersHorizontal, ChevronRight, ChevronLeft, Building2, UtensilsCrossed, PartyPopper, Tv, Sun, Home, TreePine, Utensils } from "lucide-react"

const SPACES_FILTERS = [
  { label: "Rooftop", icon: Sun },
  { label: "Indoor", icon: Home },
  { label: "Outdoor", icon: TreePine },
  { label: "Event Hall", icon: PartyPopper },
  { label: "Restaurant", icon: Utensils },
  { label: "Studio", icon: Tv }
]

const SPACE_CATEGORIES = [
  { name: "Rooftops", nameKa: "ტერასები", icon: Building2 },
  { name: "Event Halls", nameKa: "დარბაზები", icon: PartyPopper },
  { name: "Restaurants", nameKa: "რესტორნები", icon: UtensilsCrossed },
  { name: "Studios", nameKa: "სტუდიები", icon: Tv },
]

export default function SpacesPage() {
  const { language } = useLanguage()
  const isGeorgian = language === "ka"
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Mock data
  const spaces = staticVenuesData.filter(v => v.id === 3 || v.id === 4)
  const featuredSpaces = spaces
  const popularSpaces = spaces

  const resolveLabel = (key: string) => {
    const labels: Record<string, string> = {
      skylinePenthouse: isGeorgian ? "სქაილაინ პენტჰაუსი" : "Skyline Penthouse",
      gardenVilla: isGeorgian ? "ბაღის ვილა" : "Garden Villa",
      rooftopTerrace: isGeorgian ? "მზის ჩასვლის ტერასა" : "Sunset Rooftop",
      loftStudio: isGeorgian ? "ლაით სტუდია" : "Light Studio",
      seasideVilla: isGeorgian ? "ზღვისპირა ვილა" : "Seaside Villa",
      mountainRetreat: isGeorgian ? "მთის თავშესაფარი" : "Mountain Retreat",
      vakeTbilisi: isGeorgian ? "ვაკე, თბილისი" : "Vake, Tbilisi",
      saburtaloTbilisi: isGeorgian ? "საბურთალო, თბილისი" : "Saburtalo, Tbilisi",
      oldTownTbilisi: isGeorgian ? "ძველი თბილისი" : "Old Town, Tbilisi",
      veraTbilisi: isGeorgian ? "ვერა, თბილისი" : "Vera, Tbilisi",
      batumi: isGeorgian ? "ბათუმი" : "Batumi",
      borjomi: isGeorgian ? "ბორჯომი" : "Borjomi",
    }
    return labels[key] || key
  }

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

  return (
    <main className="min-h-screen bg-[#f7f6fd] flex flex-col">
      <Header />
      
      <div className="flex-1 pt-24 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#26215c] tracking-tight max-w-3xl leading-[1.1]">
            {isGeorgian ? "იპოვეთ იდეალური სივრცე ღონისძიებისთვის" : "Find the perfect event space"}
          </h1>
          <p className="mt-6 text-lg text-[#534ab7] max-w-2xl">
            {isGeorgian 
              ? "პროფესიონალური სივრცეები: დარბაზები, ტერასები, რესტორნები და სტუდიები." 
              : "Professional event spaces: halls, rooftops, restaurants, and studios."}
          </p>
        </div>

        {/* Space Categories */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {SPACE_CATEGORIES.map(cat => (
              <button key={cat.name} className="flex flex-col items-center justify-center gap-3 p-6 md:p-8 rounded-[16px] bg-white border border-[#cecbf6] hover:border-[#26215c] hover:shadow-[0_12px_40px_rgba(107,122,144,0.1)] transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-[#26215c]">
                <div className="w-14 h-14 rounded-full bg-[#f7f6fd] flex items-center justify-center text-[#26215c] group-hover:bg-[#26215c] group-hover:text-white transition-colors duration-300">
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-[#26215c] text-[15px]">
                  {isGeorgian ? cat.nameKa : cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-20 z-30 bg-[#f7f6fd]/95 backdrop-blur-md pb-4 mb-10 pt-2 border-y border-[#cecbf6]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2">
              {SPACES_FILTERS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => setActiveFilter(activeFilter === chip.label ? null : chip.label)}
                  className={`px-4 py-2 rounded-full border font-medium text-sm transition-colors flex-shrink-0 flex items-center gap-2 ${
                    activeFilter === chip.label
                      ? "border-[#26215c] bg-[#26215c] text-white"
                      : "border-[#cecbf6] bg-white text-[#534ab7] hover:border-[#26215c]/30"
                  }`}
                >
                  <chip.icon className="w-4 h-4" />
                  {chip.label}
                </button>
              ))}
            </div>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[#cecbf6] bg-white text-[#26215c] font-semibold text-sm hover:border-[#26215c] transition-colors ml-4 flex-shrink-0 shadow-sm">
              <SlidersHorizontal className="w-4 h-4" />
              {isGeorgian ? "მეტი ფილტრი" : "More Filters"}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-20">
          
          {/* Featured Spaces (Horizontal Scroll) */}
          <section className="relative">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#26215c]">
                  {isGeorgian ? "რჩეული სივრცეები" : "Featured Spaces"}
                </h2>
              </div>
              
              {/* Navigation Arrows */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className={`w-10 h-10 rounded-full border border-[#cecbf6] bg-white flex items-center justify-center transition-all cursor-pointer ${
                    canScrollLeft
                      ? "hover:bg-[#f7f6fd] hover:border-[#26215c]/30 text-[#26215c] shadow-sm"
                      : "opacity-40 cursor-not-allowed text-[#534ab7]"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className={`w-10 h-10 rounded-full border border-[#cecbf6] bg-white flex items-center justify-center transition-all cursor-pointer ${
                    canScrollRight
                      ? "hover:bg-[#f7f6fd] hover:border-[#26215c]/30 text-[#26215c] shadow-sm"
                      : "opacity-40 cursor-not-allowed text-[#534ab7]"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div 
              ref={scrollContainerRef}
              onScroll={checkScrollability}
              className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {featuredSpaces.map(venue => (
                <div key={venue.id} className="min-w-[280px] md:min-w-[340px] lg:min-w-[400px] snap-start">
                  <BrowseVenueCard venue={venue} resolveLabel={resolveLabel} />
                </div>
              ))}
              {/* Duplicate for demo visual volume */}
              {featuredSpaces.map(venue => (
                <div key={`${venue.id}-dup`} className="min-w-[280px] md:min-w-[340px] lg:min-w-[400px] snap-start">
                  <BrowseVenueCard venue={{...venue, id: venue.id + 100}} resolveLabel={resolveLabel} />
                </div>
              ))}
            </div>
          </section>

          {/* Popular Spaces (Grid) */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#26215c]">
                {isGeorgian ? "პოპულარული სივრცეები" : "Popular Spaces"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {popularSpaces.map(venue => (
                <BrowseVenueCard key={venue.id} venue={venue} resolveLabel={resolveLabel} />
              ))}
              {popularSpaces.map(venue => (
                <BrowseVenueCard key={`${venue.id}-dup`} venue={{...venue, id: venue.id + 100}} resolveLabel={resolveLabel} />
              ))}
            </div>
          </section>

          {/* All Spaces */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#26215c]">
                {isGeorgian ? "ყველა სივრცე" : "All Spaces"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {spaces.map(venue => (
                <BrowseVenueCard key={venue.id} venue={venue} resolveLabel={resolveLabel} />
              ))}
              {spaces.map(venue => (
                <BrowseVenueCard key={`${venue.id}-dup`} venue={{...venue, id: venue.id + 100}} resolveLabel={resolveLabel} />
              ))}
              {spaces.map(venue => (
                <BrowseVenueCard key={`${venue.id}-dup2`} venue={{...venue, id: venue.id + 200}} resolveLabel={resolveLabel} />
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <button className="px-8 py-3 rounded-xl border border-[#26215c] text-[#26215c] font-bold hover:bg-[#26215c] hover:text-white transition-colors">
                {isGeorgian ? "მეტის ჩატვირთვა" : "Load more"}
              </button>
            </div>
          </section>

        </div>
      </div>
      
      <Footer />
    </main>
  )
}
