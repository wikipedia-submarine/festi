"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Home, Search, ChevronDown, Check, LayoutGrid, Building2, TreePalm, Sunset, Clapperboard } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [activeField, setActiveField] = useState<string | null>(null)

  const categoryRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)

  const categoryIcons: Record<string, React.ReactNode> = {
    all: <LayoutGrid className="w-4 h-4 text-white/70" />,
    houses: <Home className="w-4 h-4 text-white/70" />,
    "birthday-centers": <TreePalm className="w-4 h-4 text-white/70" />,
    spaces: <Building2 className="w-4 h-4 text-white/70" />,
  }

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Houses", label: "Houses" },
    { value: "Birthday Centers", label: "Birthday Centers" },
    { value: "Spaces", label: "Spaces" },
  ]

  const locationOptions = [
    { value: "all", label: "All Georgia", sub: "Any city" },
    { value: "Tbilisi", label: "Tbilisi", sub: "Capital" },
    { value: "Batumi", label: "Batumi", sub: "Seaside" },
    { value: "Kutaisi", label: "Kutaisi", sub: "Historic city" },
    { value: "Kazbegi", label: "Kazbegi", sub: "Mountains" },
  ]

  useEffect(() => {
    setMounted(true)
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false)
        if (activeField === "category") setActiveField(null)
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false)
        if (activeField === "location") setActiveField(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [activeField])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (selectedLocation !== "all") params.set("city", selectedLocation)
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ''}`)
  }



  return (
    <section className="homepage-hero relative w-full h-[580px] md:h-[640px] lg:h-[700px] min-[1440px]:h-[780px] min-[1700px]:h-[900px] overflow-visible bg-transparent z-[40]">
      <div
        className="absolute top-0 left-0 right-0 bottom-[60px] z-1 bg-no-repeat bg-cover w-full h-[calc(100%-60px)] pointer-events-none"
        style={{
          backgroundImage: "url('/images/2.png')",
          backgroundPosition: "65% 60%",
        }}
      />
      {/* Top fade — makes top of hero image softer, middle/bottom more prominent */}
      <div className="absolute top-0 left-0 right-0 bottom-[60px] z-[2] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, transparent 100%)" }} />

      <div className="relative z-10 w-full max-w-[1400px] min-[1440px]:max-w-[1500px] min-[1700px]:max-w-[1650px] mx-auto h-full flex flex-col items-center justify-center px-6 md:px-12 pt-20 min-[1440px]:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="homepage-hero-text flex flex-col items-center text-center max-w-[900px] w-full"
        >

          <h1 className="text-[#eae8ff] font-bold text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] leading-[1.05] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            Discover exceptional<br className="hidden sm:block" /> spaces in <span className="text-[#d4d0ff] italic font-serif font-light tracking-normal">Georgia</span>
          </h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16, x: "-50%" }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 16, x: "-50%" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-[60px] left-1/2 w-[calc(100%-3rem)] md:w-full max-w-[680px] z-30"
        >
          <div className="flex flex-row items-stretch bg-[#f7f6fd] rounded-t-[24px] rounded-b-none p-2 shadow-[0_-8px_24px_rgba(107,122,144,0.08)] relative">
            {/* Left Curve Connection */}
            <svg className="absolute -left-[24px] bottom-0 w-[24px] h-[24px] pointer-events-none hidden md:block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 0V24H0C13.2548 24 24 13.2548 24 0Z" fill="#f7f6fd" />
            </svg>
            {/* Right Curve Connection */}
            <svg className="absolute -right-[24px] bottom-0 w-[24px] h-[24px] pointer-events-none hidden md:block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0V24H24C10.7452 24 0 13.2548 0 0Z" fill="#f7f6fd" />
            </svg>

            {/* Date Field (Static Anytime) — hidden on mobile */}
            <div className="hidden md:flex flex-1 items-center gap-3 px-5 py-4 rounded-xl cursor-default">
              <Calendar className="w-4 h-4 flex-shrink-0 text-[#534ab7]" />
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#534ab7] leading-none mb-1">When</span>
                <span className="text-[14px] font-semibold text-[#26215c] truncate">
                  Anytime
                </span>
              </div>
            </div>

            {/* Divider (after When) — hidden on mobile */}
            <div className="hidden md:block w-px self-stretch my-2.5 bg-[#cecbf6]" />

            {/* Category Field */}
            <div
              ref={categoryRef}
              className={`flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-4 cursor-pointer rounded-xl transition-colors duration-200 relative ${activeField === "category" ? "bg-[#f7f6fd]" : "hover:bg-[#f7f6fd]/60"}`}
              onClick={() => {
                setCategoryOpen(!categoryOpen);
                setLocationOpen(false);
                setActiveField("category");
              }}
            >
              <Home className={`w-4 h-4 flex-shrink-0 ${activeField === "category" ? "text-[#26215c]" : "text-[#534ab7]"}`} />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#534ab7] leading-none mb-1">Venue</span>
                <span className="text-[14px] font-semibold text-[#26215c] truncate">
                  {selectedCategory === "all" ? "All types" : categories.find(c => c.value === selectedCategory)?.label}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryOpen ? "rotate-180 text-[#26215c]" : "text-[#534ab7]"}`} />

              {categoryOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-[220px] bg-white rounded-xl shadow-[0_12px_40px_rgba(107,122,144,0.14),0_4px_12px_rgba(107,122,144,0.06)] border border-[#cecbf6] overflow-hidden z-[9999] py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat.value); setCategoryOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors duration-150 ${selectedCategory === cat.value ? "bg-[#f7f6fd]" : "hover:bg-[#f7f6fd]/60"}`}
                    >

                      <span className={`text-[13px] flex-1 ${selectedCategory === cat.value ? "text-[#26215c] font-semibold" : "text-[#26215c]/70 font-medium"}`}>
                        {cat.label}
                      </span>
                      {selectedCategory === cat.value && (
                        <Check className="w-3.5 h-3.5 text-[#26215c]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider (between Venue and Location) */}
            <div className="w-px self-stretch my-2.5 bg-[#cecbf6]" />

            {/* Location Field */}
            <div
              ref={locationRef}
              className={`flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-4 cursor-pointer rounded-xl transition-colors duration-200 relative ${activeField === "location" ? "bg-[#f7f6fd]" : "hover:bg-[#f7f6fd]/60"}`}
              onClick={() => {
                setLocationOpen(!locationOpen);
                setCategoryOpen(false);
                setActiveField("location");
              }}
            >
              <MapPin className={`w-4 h-4 flex-shrink-0 ${activeField === "location" ? "text-[#26215c]" : "text-[#534ab7]"}`} />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#534ab7] leading-none mb-1">Location</span>
                <span className="text-[14px] font-semibold text-[#26215c] truncate">
                  {selectedLocation === "all" ? "Anywhere" : locationOptions.find(l => l.value === selectedLocation)?.label}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${locationOpen ? "rotate-180 text-[#26215c]" : "text-[#534ab7]"}`} />

              {locationOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-[200px] bg-white rounded-xl shadow-[0_12px_40px_rgba(107,122,144,0.14),0_4px_12px_rgba(107,122,144,0.06)] border border-[#cecbf6] overflow-hidden z-[9999] py-1">
                  {locationOptions.map((loc) => (
                    <button
                      key={loc.value}
                      onClick={(e) => { e.stopPropagation(); setSelectedLocation(loc.value); setLocationOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors duration-150 ${selectedLocation === loc.value ? "bg-[#f7f6fd]" : "hover:bg-[#f7f6fd]/60"}`}
                    >
                      <div className="flex flex-col flex-1">
                        <span className={`text-[13px] ${selectedLocation === loc.value ? "text-[#26215c] font-semibold" : "text-[#26215c]/70 font-medium"}`}>
                          {loc.label}
                        </span>
                        <span className="text-[10px] text-[#534ab7] font-medium">{loc.sub}</span>
                      </div>
                      {selectedLocation === loc.value && (
                        <Check className="w-3.5 h-3.5 text-[#26215c]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-[#26215c] hover:bg-black text-white rounded-xl px-4 md:px-6 py-4 font-semibold text-[14px] ml-1.5 flex items-center justify-center gap-2 md:gap-2.5 cursor-pointer transition-colors duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
            >
              <Search className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="hidden min-[400px]:inline">Search</span>
            </button>
          </div>
        </motion.div>


      </div>
    </section>
  )
}
