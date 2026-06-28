"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/language-context"
import { SlidersHorizontal, ChevronRight, ChevronLeft, Baby, Users, ShieldCheck, PartyPopper, Smile, Pizza, Wand2, Tent } from "lucide-react"

const BIRTHDAY_FILTERS = [
  { label: "Ages 3–5", icon: Baby },
  { label: "Ages 6–10", icon: Smile },
  { label: "Food Included", icon: Pizza },
  { label: "Animator Included", icon: Wand2 },
  { label: "Indoor Playground", icon: Tent }
]

// Premium specialized card for Birthday Centers
function BirthdayCenterCard({ title, titleKa, image, ages, capacity, activities, activitiesKa, isPopular = false }: any) {
  const { language } = useLanguage()
  const isGeorgian = language === "ka"
  
  return (
    <Link href="/venues/4" className="group block w-full outline-none focus-visible:ring-2 focus-visible:ring-[#26215c] rounded-[14px]">
      <div className="relative w-full rounded-[14px] overflow-hidden isolate">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#cecbf6] rounded-[14px]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
          {isPopular && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-white/90 backdrop-blur-md text-[#26215c] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                {isGeorgian ? "პოპულარული" : "Popular"}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md text-[#26215c] px-2 py-1 rounded-md shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
            </div>
          </div>
        </div>

        {/* Card Content - Trust & Activities Focused */}
        <div className="pt-4 pb-2">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-[17px] font-bold text-[#26215c] leading-snug tracking-tight">
              {isGeorgian ? titleKa : title}
            </h3>
          </div>

          {/* Key Specs */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
            <div className="flex items-center gap-1 text-[#534ab7]">
              <Baby className="w-3.5 h-3.5" />
              <span className="text-[13px] font-medium">Ages {ages}</span>
            </div>
            <div className="flex items-center gap-1 text-[#534ab7]">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[13px] font-medium">Up to {capacity}</span>
            </div>
          </div>

          {/* Activities List */}
          <div className="mt-1">
            <p className="text-[12px] text-[#534ab7] truncate">
              Includes: {(isGeorgian ? activitiesKa : activities).slice(0, 2).join(" • ")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function BirthdayCentersPage() {
  const { language } = useLanguage()
  const isGeorgian = language === "ka"
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Mock specialized data
  const centers = [
    {
      id: 1,
      title: "Magic Castle Playground",
      titleKa: "ჯადოსნური ციხესიმაგრე",
      image: "/images/venues/loft-studio.jpg", 
      ages: "3-8",
      capacity: 40,
      activities: ["Indoor Playground", "Animator & Costumes", "Kids Buffet"],
      activitiesKa: ["დახურული სათამაშო მოედანი", "ანიმატორი და კოსტიუმები", "ბავშვთა ბუფეტი"],
      isPopular: true
    },
    {
      id: 2,
      title: "Adventure Park Center",
      titleKa: "სათავგადასავლო პარკი",
      image: "/images/venues/garden-villa.jpg", 
      ages: "6-12",
      capacity: 60,
      activities: ["Trampolines & Climbing", "Arcade Games", "Pizza & Drinks Included"],
      activitiesKa: ["ბატუტები და ცოცვა", "არკადული თამაშები", "პიცა და სასმელები"],
      isPopular: false
    },
    {
      id: 3,
      title: "Tiny Tots Discovery Room",
      titleKa: "პატარების აღმოჩენების ოთახი",
      image: "/images/venues/rooftop-terrace.jpg", 
      ages: "1-5",
      capacity: 25,
      activities: ["Soft Play Area", "Sensory Games", "Parent Lounge"],
      activitiesKa: ["რბილი სათამაშო ზონა", "სენსორული თამაშები", "მშობლების დასასვენებელი"],
      isPopular: true
    },
    {
      id: 4,
      title: "Gamer's Paradise",
      titleKa: "გეიმერების სამოთხე",
      image: "/images/venues/skyline-penthouse.jpg", 
      ages: "8-14",
      capacity: 30,
      activities: ["VR Consoles & PCs", "Laser Tag", "Catering Available"],
      activitiesKa: ["VR კონსოლები და კომპიუტერები", "ლაზერ ტაგი", "კვების სერვისი"],
      isPopular: false
    }
  ]

  const ages3to5 = centers.filter(c => c.ages.includes("3") || c.ages.includes("1"))
  const ages6to10 = centers.filter(c => c.ages.includes("6") || c.ages.includes("8"))
  const popularCenters = centers.filter(c => c.isPopular)

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
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#cecbf6] text-[#26215c] text-[13px] font-bold mb-6">
            <PartyPopper className="w-4 h-4" />
            FESTIVO KIDS
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#26215c] tracking-tight max-w-3xl leading-[1.1]">
            {isGeorgian ? "იპოვეთ საუკეთესო სადღესასწაულო ცენტრი" : "Find the perfect birthday center for your child"}
          </h1>
          <p className="mt-6 text-lg text-[#534ab7] max-w-2xl">
            {isGeorgian 
              ? "უსაფრთხო, მხიარული და ასაკზე მორგებული სივრცეები დაუვიწყარი დაბადების დღისთვის." 
              : "Safe, fun, and age-appropriate spaces designed for unforgettable kids parties."}
          </p>
        </div>

        {/* Filter Chips */}
        <div className="sticky top-20 z-30 bg-[#f7f6fd]/95 backdrop-blur-md pb-4 mb-10 pt-2 border-b border-[#cecbf6]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2">
              {BIRTHDAY_FILTERS.map(chip => (
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
          
          {/* Most Popular (Horizontal Scroll) */}
          <section className="relative">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#26215c]">
                  {isGeorgian ? "ყველაზე მოთხოვნადი" : "Popular Birthday Centers"}
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
              {popularCenters.map(venue => (
                <div key={venue.id} className="min-w-[280px] md:min-w-[340px] lg:min-w-[400px] snap-start">
                  <BirthdayCenterCard {...venue} />
                </div>
              ))}
              {/* Duplicate for demo visual volume */}
              {popularCenters.map(venue => (
                <div key={`${venue.id}-dup`} className="min-w-[280px] md:min-w-[340px] lg:min-w-[400px] snap-start">
                  <BirthdayCenterCard {...venue} id={venue.id + 10} />
                </div>
              ))}
              {popularCenters.map(venue => (
                <div key={`${venue.id}-dup2`} className="min-w-[280px] md:min-w-[340px] lg:min-w-[400px] snap-start">
                  <BirthdayCenterCard {...venue} id={venue.id + 20} />
                </div>
              ))}
            </div>
          </section>

          {/* Best for Ages 3-5 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#26215c]">
                {isGeorgian ? "საუკეთესო 3-5 წლის ასაკისთვის" : "Best for Ages 3–5"}
              </h2>
              <p className="text-[#534ab7] mt-1 text-sm">
                {isGeorgian ? "უსაფრთხო და რბილი სათამაშო ზონები პატარებისთვის" : "Safe, soft play areas perfect for toddlers"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {ages3to5.map(venue => (
                <BirthdayCenterCard key={venue.id} {...venue} />
              ))}
            </div>
          </section>

          {/* Best for Ages 6-10 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#26215c]">
                {isGeorgian ? "საუკეთესო 6-10 წლის ასაკისთვის" : "Best for Ages 6–10"}
              </h2>
              <p className="text-[#534ab7] mt-1 text-sm">
                {isGeorgian ? "აქტიური თამაშები და თავგადასავლები" : "Active play and adventures for older kids"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {ages6to10.map(venue => (
                <BirthdayCenterCard key={venue.id} {...venue} />
              ))}
            </div>
          </section>

          {/* All Centers */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#26215c]">
                {isGeorgian ? "ყველა ცენტრი" : "All Centers"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {centers.map(venue => (
                <BirthdayCenterCard key={venue.id} {...venue} />
              ))}
              {centers.map(venue => (
                <BirthdayCenterCard key={`${venue.id}-dup`} {...venue} id={venue.id + 10} />
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
