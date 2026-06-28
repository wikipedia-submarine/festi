"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const LOCATIONS = [
  {
    name: "Tbilisi",
    nameKa: "თბილისი",
    stays: "120+ stays",
    staysKa: "120+ სივრცე",
    image: "/images/tbilisi.webp",
    href: "/citys/tbilisi",
  },
  {
    name: "Batumi",
    nameKa: "ბათუმი",
    stays: "80+ stays",
    staysKa: "80+ სივრცე",
    image: "/images/batumi.webp",
    href: "/citys/batumi",
  },
  {
    name: "Kutaisi",
    nameKa: "ქუთაისი",
    stays: "40+ stays",
    staysKa: "40+ სივრცე",
    image: "/images/kutaisi.png",
    href: "/citys/kutaisi",
  },
  {
    name: "Kazbegi",
    nameKa: "ყაზბეგი",
    stays: "25+ stays",
    staysKa: "25+ სივრცე",
    image: "/images/kazbegi.jpg",
    href: "/citys/kazbegi",
  },
]

export function PopularLocations() {
  const { language } = useLanguage()
  const isGeorgian = language === "ka"

  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-8 md:py-10 relative z-[1]">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-3 mb-6 md:mb-8">
        <h2 className="text-[#26215c] text-[22px] md:text-[26px] font-bold tracking-tight">
          {isGeorgian ? "პოპულარული ლოკაციები" : "Popular locations"}
        </h2>
        <Link
          href="/browse"
          className="group flex items-center gap-2 text-[13px] font-semibold text-[#26215c] hover:opacity-70 transition-opacity whitespace-nowrap flex-shrink-0"
        >
          {isGeorgian ? "ყველა ლოკაცია" : "View all"}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Location Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {LOCATIONS.map((loc) => (
          <Link
            key={loc.name}
            href={loc.href}
            className="group relative h-[140px] md:h-[155px] rounded-[14px] overflow-hidden block cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)] transition-shadow duration-300 ease-out"
          >
            {/* Background Image */}
            <Image
              src={loc.image}
              alt={isGeorgian ? loc.nameKa : loc.name}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              sizes="(min-width: 768px) 25vw, 50vw"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Text Content — bottom-left */}
            <div className="absolute bottom-0 left-0 p-4 md:p-5 z-10">
              <h3 className="text-white font-bold text-[17px] md:text-[19px] leading-tight tracking-tight mb-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                {isGeorgian ? loc.nameKa : loc.name}
              </h3>
              <p className="text-white/80 text-[10px] md:text-[11px] font-medium tracking-wide">
                {isGeorgian ? loc.staysKa : loc.stays}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
