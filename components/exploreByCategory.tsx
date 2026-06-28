"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

const CATEGORIES = [
  {
    title: "Birthday Centers",
    titleKa: "დაბადების ცენტრები",
    description: "Kids Venues, Playgrounds & Entertainment Centers",
    descriptionKa: "ბავშვთა სადღესასწაულო ცენტრები და სათამაშო სივრცეები",
    image: "/images/venues/loft-studio.jpg", // Replace with an appropriate birthday image
    href: "/browse?category=Birthday Centers"
  },
  {
    title: "Spaces",
    titleKa: "სივრცეები",
    description: "Event Halls, Restaurants & Premium Spaces",
    descriptionKa: "სადღესასწაულო დარბაზები, რესტორნები და პრემიუმ სივრცეები",
    image: "/images/venues/rooftop-terrace.jpg", // Replace with an appropriate wedding image
    href: "/browse?category=Spaces"
  },
  {
    title: "Houses",
    titleKa: "სახლები",
    description: "Villas, Pool Houses & Cottages for Events",
    descriptionKa: "ვილები, აუზიანი სახლები და კოტეჯები წვეულებისთვის",
    image: "/images/venues/garden-villa.jpg",
    href: "/browse?category=Houses"
  },
]

export function ExploreByCategory({ cityHash }: { cityHash?: string } = {}) {
  const { language } = useLanguage()
  const isGeorgian = language === "ka"
  
  return (
    <section className="w-full overflow-visible bg-[#f7f6fd] relative z-[20]" style={{ marginTop: "-60px" }}>
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-10 md:pt-14 pb-6 md:pb-8 relative z-[1]">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-[#26215c] text-[28px] md:text-[34px] font-bold tracking-tight">
            {isGeorgian ? "კატეგორიები" : "Categories"}
          </h2>
        </div>

        {/* 3 cards, gap 16px (gap-4) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => {
            const finalHref = cityHash ? `${cat.href}#${cityHash}` : cat.href
            return (
            <Link 
              key={i}
              href={finalHref}
              className="group relative h-[340px] md:h-[480px] overflow-hidden flex flex-col justify-end cursor-pointer isolate w-full rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.14)] transition-shadow duration-300 ease-out"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 -z-20 bg-cover bg-center"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              
              {/* Gradient Overlay: dark gradient overlay from bottom to top */}
              <div 
                className="absolute inset-0 -z-10 transition-opacity duration-300 ease-out"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)"
                }}
              />

              {/* Hover Shadow Overlay */}
              <div className="absolute inset-0 -z-10 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 ease-out pointer-events-none" />

              {/* Content Formatting - Bottom Left, 24px padding */}
              <div className="relative z-10 p-[24px] w-full flex flex-col items-start">
                <h3 className="text-white font-bold text-[26px] md:text-[30px] leading-tight mb-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  {isGeorgian ? cat.titleKa : cat.title}
                </h3>
                <p className="text-white/85 text-[14px] md:text-[15px] font-medium leading-[1.4] line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
                  {isGeorgian ? cat.descriptionKa : cat.description}
                </p>
              </div>
            </Link>
          )})}
        </div>
      </div>
    </section>
  )
}
