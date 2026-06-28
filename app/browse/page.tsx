"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ListYourSpace } from "@/components/listYourSpace"
import { Heart, Star, ChevronLeft, ChevronRight, Check, ChevronDown, MapPin, Users, Home, BedDouble, Bath, SlidersHorizontal } from "lucide-react"
import { getApprovedVenues, type FirestoreVenue } from "@/lib/firestore-venues"
import { getImageFromFirestore } from "@/lib/cloud-storage"
import { staticVenuesData } from "@/lib/static-venues"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { toggleSavedVenue } from "@/lib/firestore-users"
import { FeaturedVenueCard } from "@/components/featuredVenueCard"
import "./houses.css"

// ═══════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════

interface PropertyData {
  id: string
  title: string
  location: string
  price: number
  image: string
  images?: string[]
  description?: string
  reviewsCount?: number
  rating: number
  badge: string
  tag: "Popular" | "Recommended"
  maxGuests?: number
  amenities?: string[]
}

// ═══════════════════════════════════════════════════════════
//  DATA HELPERS
// ═══════════════════════════════════════════════════════════

const ITEMS_PER_PAGE = 9

function mapStaticVenues(): PropertyData[] {
  const allVenues = [
    ...staticVenuesData,
    ...staticVenuesData.map(v => ({ ...v, id: Number(v.id) + 100 })),
    ...staticVenuesData.map(v => ({ ...v, id: Number(v.id) + 200 }))
  ]

  return allVenues.map((sv) => ({
    id: String(sv.id),
    title: sv.description || sv.nameKey,
    location: sv.locationKey,
    price: sv.price,
    image: sv.image,
    images: [
      sv.image,
      "/images/venues/garden-villa.jpg",
      "/images/venues/mountain-retreat.jpg",
      "/images/venues/seaside-villa.jpg",
      "/images/venues/loft-studio.jpg",
      "/images/venues/skyline-penthouse.jpg"
    ].filter(Boolean) as string[],
    description: sv.description,
    reviewsCount: 15 + (Number(sv.id) * 3 || 0),
    rating: 4.7 + (Number(sv.id) % 3) * 0.1,
    badge: sv.category || (sv.premium ? "Houses" : "Houses"),
    tag: sv.premium ? "Popular" : ("Recommended" as const),
    maxGuests: sv.guests,
    amenities: sv.amenities,
  }))
}

/** Convert Firestore venues into PropertyData */
function mapFirestoreVenues(venues: FirestoreVenue[]): PropertyData[] {
  return venues.map((v) => ({
    id: v.id || "",
    title: v.spaceName,
    location: v.location,
    price: v.price,
    image: (v.images && v.images.length > 0 && v.images[0]?.trim()) ? v.images[0] : "/images/venues/garden-villa.jpg",
    images: v.images,
    description: v.description,
    reviewsCount: v.reviewsCount || 0,
    rating: v.rating || 0,
    badge: v.category || "Villa",
    tag: (v.price > 400 ? "Popular" : "Recommended") as "Popular" | "Recommended",
    maxGuests: v.maxGuests,
    amenities: v.amenities,
  }))
}

// ═══════════════════════════════════════════════════════════
//  HERO (no search, Curacao image, strong overlay)
// ═══════════════════════════════════════════════════════════

const HeroBanner = memo(function HeroBanner() {
  return (
    <div className="houses-hero" style={{ height: "43vh", maxHeight: "320px", minHeight: "213px" }}>
      <Image
        src="/images/HEADER2-12-Curacao-Villa-Wide-View-79---kopie.jpg"
        alt="Luxury villa in Curaçao"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "bottom" }}
        className="houses-hero__image"
      />
      <div className="houses-hero__overlay" />
      <div className="houses-hero__typography">
        <h1 className="houses-hero__title">Find your next stay</h1>
        <p className="houses-hero__subtext">Explore curated villas, apartments, and unique stays</p>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════
//  PROPERTY CARD
// ═══════════════════════════════════════════════════════════

const PropertyCard = memo(function PropertyCard({ property }: { property: PropertyData }) {
  const { language } = useLanguage()
  const isGeorgian = language === "ka"
  const { user, userProfile, updateProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null)
  const isSaved = optimisticSaved !== null ? optimisticSaved : (userProfile?.savedVenueIds?.includes(property.id) || false)
  
  const validImages = property.images?.filter(img => img && img.trim().length > 0) || []
  const imagesList = validImages.length > 0 ? validImages : [property.image || "/images/venues/garden-villa.jpg"]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [resolvedImages, setResolvedImages] = useState<Record<string, string>>({})
  const [imageLoading, setImageLoading] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const currentRawImage = imagesList[currentImageIndex]

  useEffect(() => {
    let isMounted = true
    async function resolveImage() {
      if (currentRawImage.startsWith("firestore://") && !resolvedImages[currentRawImage]) {
        setImageLoading(true)
        try {
          const imageId = currentRawImage.replace("firestore://", "")
          const resolved = await getImageFromFirestore(imageId)
          if (isMounted && resolved) {
            setResolvedImages(prev => ({ ...prev, [currentRawImage]: resolved }))
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
  }, [currentImageIndex, currentRawImage, resolvedImages])

  const finalImage = currentRawImage.startsWith("firestore://") 
    ? (resolvedImages[currentRawImage] || "/images/venues/garden-villa.jpg")
    : (currentRawImage || "/images/venues/garden-villa.jpg")
    
  const isLoading = imageLoading || (currentRawImage.startsWith("firestore://") && !resolvedImages[currentRawImage])

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % imagesList.length)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length)
  }

  const displayDesc = property.description || `Escape to luxury in this beautiful ${property.badge?.toLowerCase() || "property"} in ${property.location}. Perfect for your next getaway with modern amenities.`
  const showReadMore = displayDesc.length > 95

  return (
    <Link href={`/venues/${property.id}`} className="houses-card group">
      <div className="houses-card__image-wrap">
        {isLoading ? (
          <div className="w-full h-full bg-[#f0f0f5] animate-pulse" />
        ) : (
          <Image
            src={finalImage}
            alt={property.title}
            fill
            className={`houses-card__image ${imgLoaded ? "loaded" : ""}`}
            onLoad={() => setImgLoaded(true)}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
        
        {/* Dark Overlay (disappears on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-0 pointer-events-none z-[1]" />
        
        {/* Top Right: Favorite Button */}
        <button 
          className="houses-card__favorite"
          disabled={isSaving}
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!user) return
            const newSavedState = !isSaved
            setOptimisticSaved(newSavedState)
            setIsSaving(true)
            try {
              const { isSaved: serverState, updatedIds } = await toggleSavedVenue(user.uid, property.id)
              setOptimisticSaved(serverState)
              await updateProfile({ savedVenueIds: updatedIds })
            } catch (error) {
              console.error("Failed to save venue:", error)
              setOptimisticSaved(!newSavedState)
            } finally {
              setIsSaving(false)
            }
          }}
        >
          <Heart className={`w-5 h-5 transition-colors ${isSaved ? "fill-[#7f77dd] text-[#7f77dd]" : "text-[#26215c] stroke-[1.5]"}`} />
        </button>

        {/* Bottom Right: Location Badge */}
        <div className="houses-card__location-badge">
          <MapPin className="w-[14px] h-[14px]" />
          <span>{property.location}</span>
        </div>

        {/* Hover Slider Buttons */}
        {imagesList.length > 1 && (
          <div className="houses-card__slider">
            <button 
              onClick={handlePrevImage} 
              className="houses-card__slider-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextImage} 
              className="houses-card__slider-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Thumbnails (visible on hover) */}
        {imagesList.length > 1 && (
          <div className="houses-card__thumbs">
            {[0, 1, 2].map((offset) => {
                const idx = (currentImageIndex + offset) % imagesList.length;
                const img = imagesList[idx];
                return (
                  <button
                    key={offset}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(idx); }}
                    className={`houses-card__thumb ${offset === 0 ? "houses-card__thumb--active" : ""}`}
                  >
                    <Image src={img.startsWith("firestore://") ? (resolvedImages[img] || "/images/venues/garden-villa.jpg") : img} alt="" fill className="object-cover" />
                  </button>
                )
            })}
          </div>
        )}
      </div>

      <div className="houses-card__body">
        <h3 className={`houses-card__title ${isGeorgian ? "font-georgian" : ""}`}>
          {property.title}
        </h3>
        
        <p className="houses-card__desc" title={displayDesc}>
          {displayDesc}
        </p>
        
        {showReadMore && (
          <span className="houses-card__read-more">Read more</span>
        )}
        
        <div className="flex items-center flex-wrap gap-1.5 text-[13px] font-medium text-[#534ab7] mb-6 mt-1">
          <span>Entire venue</span>
          <span className="text-[10px] opacity-60 px-1">•</span>
          <span>{Math.max(1, Math.ceil((property.maxGuests || 2) / 2))} beds</span>
          <span className="text-[10px] opacity-60 px-1">•</span>
          <span>{Math.max(1, Math.floor((property.maxGuests || 2) / 3)) || 1} baths</span>
        </div>

        <div className="houses-card__price-row flex justify-between items-center w-full">
          <div className="flex items-baseline gap-[6px]">
            <span className="houses-card__price-amount">₾{property.price}</span>
            <span className="houses-card__price-period">/ night</span>
          </div>
          {property.rating > 0 && (
            <div className="flex items-center gap-1 font-semibold text-[14px] text-[#26215c]">
              <Star className="w-[14px] h-[14px] fill-[#7f77dd] text-[#7f77dd]" /> 
              <span>{property.rating.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
})

// ═══════════════════════════════════════════════════════════
//  BIRTHDAY CENTER CARD (HORIZONTAL)
// ═══════════════════════════════════════════════════════════

const BirthdayCenterCard = memo(function BirthdayCenterCard({ property }: { property: PropertyData }) {
  const { language } = useLanguage()
  const isGeorgian = language === "ka"
  const { user, userProfile, updateProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null)
  const isSaved = optimisticSaved !== null ? optimisticSaved : (userProfile?.savedVenueIds?.includes(property.id) || false)

  const validImages = property.images?.filter(img => img && img.trim().length > 0) || []
  const imagesList = validImages.length > 0 ? validImages : [property.image || "/images/venues/garden-villa.jpg"]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [resolvedImages, setResolvedImages] = useState<Record<string, string>>({})
  const [imageLoading, setImageLoading] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const currentRawImage = imagesList[currentImageIndex]

  useEffect(() => {
    let isMounted = true
    async function resolveImage() {
      if (currentRawImage.startsWith("firestore://") && !resolvedImages[currentRawImage]) {
        setImageLoading(true)
        try {
          const imageId = currentRawImage.replace("firestore://", "")
          const resolved = await getImageFromFirestore(imageId)
          if (isMounted && resolved) {
            setResolvedImages(prev => ({ ...prev, [currentRawImage]: resolved }))
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
  }, [currentImageIndex, currentRawImage, resolvedImages])

  const finalImage = currentRawImage.startsWith("firestore://")
    ? (resolvedImages[currentRawImage] || "/images/venues/garden-villa.jpg")
    : (currentRawImage || "/images/venues/garden-villa.jpg")

  const isLoading = imageLoading || (currentRawImage.startsWith("firestore://") && !resolvedImages[currentRawImage])

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % imagesList.length)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length)
  }

  const displayDesc = property.description || `Celebrate your special day at this amazing birthday venue in ${property.location}. Perfect for parties and celebrations.`

  return (
    <Link href={`/venues/${property.id}`} className="bc-card group">
      {/* Image Section */}
      <div className="bc-card__image-section">
        {isLoading ? (
          <div className="w-full h-full bg-[#f0f0f5] animate-pulse" />
        ) : (
          <Image
            src={finalImage}
            alt={property.title}
            fill
            className={`bc-card__image ${imgLoaded ? "loaded" : ""}`}
            onLoad={() => setImgLoaded(true)}
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        )}

        {/* Favorite Button */}
        <button
          className="bc-card__favorite"
          disabled={isSaving}
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!user) return
            const newSavedState = !isSaved
            setOptimisticSaved(newSavedState)
            setIsSaving(true)
            try {
              const { isSaved: serverState, updatedIds } = await toggleSavedVenue(user.uid, property.id)
              setOptimisticSaved(serverState)
              await updateProfile({ savedVenueIds: updatedIds })
            } catch (error) {
              console.error("Failed to save venue:", error)
              setOptimisticSaved(!newSavedState)
            } finally {
              setIsSaving(false)
            }
          }}
        >
          <Heart className={`w-5 h-5 transition-colors ${isSaved ? "fill-[#7f77dd] text-[#7f77dd]" : "text-[#26215c] stroke-[1.5]"}`} />
        </button>

        {/* Slider Buttons */}
        {imagesList.length > 1 && (
          <div className="bc-card__slider">
            <button onClick={handlePrevImage} className="bc-card__slider-btn">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNextImage} className="bc-card__slider-btn">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Image Dots */}
        {imagesList.length > 1 && (
          <div className="bc-card__dots">
            {imagesList.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(idx); }}
                className={`bc-card__dot ${idx === currentImageIndex ? "bc-card__dot--active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="bc-card__body">
        <div className="bc-card__body-top">
          <span className="bc-card__category-label">Birthday Center</span>

          <h3 className={`bc-card__title ${isGeorgian ? "font-georgian" : ""}`}>
            {property.title}
          </h3>

          <div className="bc-card__location">
            <MapPin className="w-[13px] h-[13px]" />
            <span>{property.location}</span>
          </div>

          <p className="bc-card__desc">{displayDesc}</p>

          <span className="bc-card__guests">
            <Users className="w-[13px] h-[13px]" />
            Up to {property.maxGuests || 30} guests
          </span>
        </div>

        <div className="bc-card__footer">
          <div className="bc-card__price-block">
            <span className="bc-card__price-amount">₾{property.price}</span>
            <span className="bc-card__price-period">/ event</span>
          </div>
          {property.rating > 0 && (
            <div className="bc-card__rating">
              <Star className="w-[14px] h-[14px] fill-[#7f77dd] text-[#7f77dd]" />
              <span>{property.rating.toFixed(2)}</span>
            </div>
          )}
          <div className="bc-card__cta">
            View Details
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
})

// ═══════════════════════════════════════════════════════════
//  SKELETON LOADER
// ═══════════════════════════════════════════════════════════

function SkeletonCard() {
  return (
    <div className="houses-skeleton-card">
      <div className="houses-skeleton-image" />
      <div className="houses-skeleton-body">
        <div className="houses-skeleton-line" />
        <div className="houses-skeleton-line houses-skeleton-line--short" />
        <div className="houses-skeleton-line houses-skeleton-line--medium" />
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="houses-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  FILTER BAR (HORIZONTAL / STICKY)
// ═══════════════════════════════════════════════════════════

const PROPERTY_TYPES = ["Villa", "Apartment", "House"]
const AMENITIES = ["Pool", "WiFi", "Pet Friendly"]

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "Houses", label: "Houses" },
  { value: "Birthday Centers", label: "Birthday Centers" },
  { value: "Spaces", label: "Spaces" },
]

const CITIES = [
  { value: "all", label: "All Cities" },
  { value: "Tbilisi", label: "Tbilisi" },
  { value: "Batumi", label: "Batumi" },
  { value: "Kutaisi", label: "Kutaisi" },
  { value: "Kazbegi", label: "Kazbegi" },
]

function FilterPill({ 
  label, 
  value, 
  isActive, 
  isOpen, 
  onClick, 
  children 
}: { 
  label: string
  value: string
  isActive?: boolean
  isOpen: boolean
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="fb-pill-wrap">
      <button
        type="button"
        className={`fb-pill ${isActive ? "fb-pill--active" : ""} ${isOpen ? "fb-pill--open" : ""}`}
        onClick={onClick}
      >
        <span className="fb-pill__label">{label}</span>
        <span className="fb-pill__value">{value}</span>
        <ChevronDown className={`fb-pill__arrow ${isOpen ? "fb-pill__arrow--open" : ""}`} />
      </button>
      {isOpen && children}
    </div>
  )
}

const FilterBar = memo(function FilterBar({
  selectedAmenities,
  onToggleAmenity,
  selectedCity,
  onCityChange,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  minGuests,
  onMinGuestsChange,
  sortBy,
  onSortChange,
  onClearAll,
  hasActiveFilters,
}: {
  selectedAmenities: string[]
  onToggleAmenity: (amenity: string) => void
  selectedCity: string
  onCityChange: (city: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  minPrice: string
  maxPrice: string
  onMinPriceChange: (val: string) => void
  onMaxPriceChange: (val: string) => void
  minGuests: string
  onMinGuestsChange: (val: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}) {
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  // Price Dropdown State
  const [tempMin, setTempMin] = useState(minPrice)
  const [tempMax, setTempMax] = useState(maxPrice)

  useEffect(() => {
    setTempMin(minPrice)
    setTempMax(maxPrice)
  }, [minPrice, maxPrice, openFilter])

  const handlePriceApply = () => {
    onMinPriceChange(tempMin)
    onMaxPriceChange(tempMax)
    setOpenFilter(null)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Detect when the bar is "stuck" for enhanced shadow
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("houses-filters")
      if (!el) return
      const rect = el.getBoundingClientRect()
      setIsStuck(rect.top <= 61)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggle = (name: string) => setOpenFilter(openFilter === name ? null : name)

  const categoryLabel = selectedCategory === "all" ? "All" : CATEGORIES.find(c => c.value === selectedCategory)?.label || "All"
  const cityLabel = selectedCity === "all" ? "Anywhere" : CITIES.find(c => c.value === selectedCity)?.label || "Anywhere"
  const amenityLabel = selectedAmenities.length > 0 ? selectedAmenities.join(", ") : "Any"
  const sortLabel = sortBy === "recommended" ? "Recommended" : sortBy === "price-low" ? "Price: Low to High" : sortBy === "price-high" ? "Price: High to Low" : sortBy === "rating-high" ? "Rating: High to Low" : "Rating: Low to High"

  return (
    <div className={`fb-bar ${isStuck ? "fb-bar--stuck" : ""}`} id="houses-filters" ref={barRef}>
      <div className="fb-bar__inner">
        {/* Category Pill */}
        <FilterPill
          label="Category"
          value={categoryLabel}
          isActive={selectedCategory !== "all"}
          isOpen={openFilter === "category"}
          onClick={() => toggle("category")}
        >
          <div className="fb-dropdown">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => { onCategoryChange(cat.value); setOpenFilter(null); }}
                className={`fb-dropdown__item ${selectedCategory === cat.value ? "fb-dropdown__item--selected" : ""}`}
              >
                <span>{cat.label}</span>
                {selectedCategory === cat.value && <Check className="fb-dropdown__check" />}
              </button>
            ))}
          </div>
        </FilterPill>

        {/* City Pill */}
        <FilterPill
          label="Location"
          value={cityLabel}
          isActive={selectedCity !== "all"}
          isOpen={openFilter === "city"}
          onClick={() => toggle("city")}
        >
          <div className="fb-dropdown">
            {CITIES.map((city) => (
              <button
                type="button"
                key={city.value}
                onClick={() => { onCityChange(city.value); setOpenFilter(null); }}
                className={`fb-dropdown__item ${selectedCity === city.value ? "fb-dropdown__item--selected" : ""}`}
              >
                <span>{city.label}</span>
                {selectedCity === city.value && <Check className="fb-dropdown__check" />}
              </button>
            ))}
          </div>
        </FilterPill>

        {/* Price Range Slider Pill */}
        <FilterPill
          label="Price"
          value={minPrice || maxPrice ? `₾${minPrice || 0} - ₾${maxPrice || 1000}` : "Any"}
          isActive={minPrice !== "" || maxPrice !== ""}
          isOpen={openFilter === "price"}
          onClick={() => toggle("price")}
        >
          <div className="fb-dropdown" style={{ width: 320, padding: 24, cursor: "default" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 text-sm font-semibold text-[#26215c]">
              <span>₾{tempMin || 0}</span>
              <span>₾{tempMax || 1000}</span>
            </div>
            <div className="price-slider-container relative h-1.5 w-full bg-[#EAEAED] rounded-full">
              {/* Active Range Highlight */}
              <div 
                className="absolute h-full bg-[#26215c] rounded-full pointer-events-none"
                style={{
                  left: `${((Number(tempMin) || 0) / 1000) * 100}%`,
                  right: `${100 - ((Number(tempMax) || 1000) / 1000) * 100}%`
                }}
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={tempMin || 0}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), (Number(tempMax) || 1000) - 10)
                  setTempMin(val.toString())
                }}
                className="price-slider-thumb absolute w-full top-0 h-full bg-transparent"
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={tempMax || 1000}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), (Number(tempMin) || 0) + 10)
                  setTempMax(val.toString())
                }}
                className="price-slider-thumb absolute w-full top-0 h-full bg-transparent"
              />
            </div>
            
            <div className="flex items-center justify-between mt-8 gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] text-[#7a7599] font-semibold uppercase tracking-wider pl-1">Min Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7599] font-medium text-sm">₾</span>
                  <input
                    type="number"
                    value={tempMin}
                    onChange={(e) => setTempMin(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#f7f6fd] border border-[#e2e0f9] focus:border-[#7f77dd] focus:bg-white rounded-xl py-2 pl-7 pr-3 text-sm font-semibold text-[#26215c] outline-none transition-all"
                  />
                </div>
              </div>
              <div className="w-4 h-[1px] bg-[#e2e0f9] mt-5"></div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] text-[#7a7599] font-semibold uppercase tracking-wider pl-1">Max Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7599] font-medium text-sm">₾</span>
                  <input
                    type="number"
                    value={tempMax}
                    onChange={(e) => setTempMax(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-[#f7f6fd] border border-[#e2e0f9] focus:border-[#7f77dd] focus:bg-white rounded-xl py-2 pl-7 pr-3 text-sm font-semibold text-[#26215c] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handlePriceApply}
              className="w-full mt-6 bg-[#26215c] hover:bg-[#342d7e] text-white font-bold text-[15px] py-3 rounded-[14px] transition-colors shadow-[0_4px_12px_rgba(38,33,92,0.15)]"
            >
              Search
            </button>
          </div>
        </FilterPill>

        {/* Guests Pill */}
        <div className="fb-pill-wrap">
          <div className={`fb-pill fb-pill--inputs ${minGuests ? "fb-pill--active" : ""}`}>
            <span className="fb-pill__label">Guests</span>
            <input
              type="number"
              placeholder="Any"
              value={minGuests}
              onChange={(e) => onMinGuestsChange(e.target.value)}
              className="fb-pill__input fb-pill__input--solo"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Amenities Pill */}
        <FilterPill
          label="Amenities"
          value={amenityLabel}
          isActive={selectedAmenities.length > 0}
          isOpen={openFilter === "amenities"}
          onClick={() => toggle("amenities")}
        >
          <div className="fb-dropdown fb-dropdown--multi">
            {AMENITIES.map((amenity) => {
              const active = selectedAmenities.includes(amenity)
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => onToggleAmenity(amenity)}
                  className={`fb-dropdown__item ${active ? "fb-dropdown__item--selected" : ""}`}
                >
                  <div className={`fb-dropdown__checkbox ${active ? "fb-dropdown__checkbox--checked" : ""}`}>
                    {active && <Check style={{ width: 10, height: 10, color: "#fff", strokeWidth: 3 }} />}
                  </div>
                  <span>{amenity}</span>
                </button>
              )
            })}
          </div>
        </FilterPill>

        {/* Clear All */}
        {hasActiveFilters && (
          <button type="button" onClick={onClearAll} className="fb-clear">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Clear all
          </button>
        )}

        {/* Sort Pill (Pushed to end) */}
        <div className="ml-auto flex shrink-0 items-center">
          <FilterPill
            label="Sort by"
            value={sortLabel}
            isActive={sortBy !== "recommended"}
            isOpen={openFilter === "sort"}
            onClick={() => toggle("sort")}
          >
            <div className="fb-dropdown" style={{ right: 0, left: "auto", transformOrigin: "top right" }}>
              {[
                { value: "recommended", label: "Recommended" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
                { value: "rating-high", label: "Rating: High to Low" },
                { value: "rating-low", label: "Rating: Low to High" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => { onSortChange(opt.value); setOpenFilter(null); }}
                  className={`fb-dropdown__item ${sortBy === opt.value ? "fb-dropdown__item--selected" : ""}`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <Check className="fb-dropdown__check" />}
                </button>
              ))}
            </div>
          </FilterPill>
        </div>
      </div>
    </div>
  )
})



// ═══════════════════════════════════════════════════════════
//  PAGINATION
// ═══════════════════════════════════════════════════════════

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | "dots")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1, 2, 3)
    if (currentPage > 4) pages.push("dots")
    const mid = Math.max(4, Math.min(totalPages - 3, currentPage))
    if (mid > 3 && mid < totalPages - 2) pages.push(mid)
    if (currentPage < totalPages - 3) pages.push("dots")
    pages.push(totalPages - 1, totalPages)
  }

  return (
    <div className="houses-pagination" id="houses-pagination">
      <button
        className="houses-pagination__btn houses-pagination__btn--nav"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{ gap: 6 }}
      >
        <ChevronLeft style={{ width: 16, height: 16 }} /> Previous
      </button>
      {pages.map((page, i) =>
        page === "dots" ? (
          <span key={`d${i}`} className="houses-pagination__dots">…</span>
        ) : (
          <button
            key={page}
            className={`houses-pagination__btn ${currentPage === page ? "houses-pagination__btn--active" : ""}`}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </button>
        )
      )}
      <button
        className="houses-pagination__btn houses-pagination__btn--nav"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{ gap: 6 }}
      >
        Next <ChevronRight style={{ width: 16, height: 16 }} />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  LIST YOUR SPACE (CUSTOM)
// ═══════════════════════════════════════════════════════════

function HousesListYourSpace() {
  return (
    <div className="houses-list-space-container">
      <div className="houses-list-space-card">
        <div style={{ flex: 1, padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: 36, fontWeight: 600, color: "#26215c", marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            List your space <br/>with Festivo
          </h2>
          <p style={{ fontSize: 16, color: "#534ab7", marginBottom: 32, lineHeight: 1.6, maxWidth: 380 }}>
            Reach thousands of guests looking for the perfect venue. Start earning today with our simple and secure platform.
          </p>
          <div>
              <Link 
                href="/list-your-space"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#26215c",
                  color: "#FFFFFF",
                  borderRadius: 14,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background-color 200ms ease, color 200ms ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#26215c"
                  e.currentTarget.style.color = "#FFFFFF"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#26215c"
                  e.currentTarget.style.color = "#FFFFFF"
                }}
              >
                <span style={{ transition: "transform 200ms ease", display: "inline-block" }}>List your space</span>
              </Link>
          </div>
        </div>
        <div style={{ width: "50%", position: "relative", minHeight: "100%" }}>
          <Image 
            src="/images/1.png" 
            alt="List your space with Festivo" 
            fill 
            style={{ objectFit: "cover", objectPosition: "center" }} 
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  CATEGORY SLIDER (FOR "ALL" VIEW)
// ═══════════════════════════════════════════════════════════

function CategorySlider({
  title,
  items,
  cardType,
  onSeeAll,
}: {
  title: string
  items: PropertyData[]
  cardType: "house" | "birthday"
  onSeeAll: () => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)
    return () => {
      el.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [updateScrollState, items])

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current) return
    // Scroll by exactly the visible container width for perfect page snapping
    const scrollAmount = trackRef.current.clientWidth
    trackRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  if (items.length === 0) return null

  const trackClass = cardType === "birthday"
    ? "cat-slider__track cat-slider__track--birthday"
    : "cat-slider__track cat-slider__track--houses"

  return (
    <div className="cat-slider-section">
      <div className="cat-slider__header">
        <h2 className="cat-slider__title">{title}</h2>
        <button className="cat-slider__see-all" onClick={onSeeAll}>
          See all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="cat-slider__track-wrap">
        {canScrollLeft && (
          <button
            className="cat-slider__arrow cat-slider__arrow--left"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className={trackClass} ref={trackRef}>
          {items.map((property) =>
            cardType === "birthday" ? (
              <BirthdayCenterCard key={property.id} property={property} />
            ) : (
              <PropertyCard key={property.id} property={property} />
            )
          )}
        </div>
        {canScrollRight && (
          <button
            className="cat-slider__arrow cat-slider__arrow--right"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function HousesPage() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minGuests, setMinGuests] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("recommended")
  const [sortOpen, setSortOpen] = useState(false)

  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasActiveFilters = selectedAmenities.length > 0 || selectedCity !== "all" || selectedCategory !== "all" || minPrice !== "" || maxPrice !== "" || minGuests !== ""

  const clearAllFilters = useCallback(() => {
    setSelectedAmenities([])
    setSelectedCity("all")
    setSelectedCategory("all")
    setMinPrice("")
    setMaxPrice("")
    setMinGuests("")
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const catParam = searchParams.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
      }

      const cityParam = searchParams.get('city');
      if (cityParam) {
        setSelectedCity(cityParam);
      } else if (window.location.hash) {
        const hash = window.location.hash.replace("#", "")
        if (hash) {
          const capitalized = hash.charAt(0).toUpperCase() + hash.slice(1).toLowerCase()
          const validCities = ["Tbilisi", "Batumi", "Kutaisi", "Kazbegi", "Borjomi"]
          if (validCities.includes(capitalized)) {
            setSelectedCity(capitalized)
          }
        }
      }
    }
  }, [])

  // Load venues from Firebase + static fallback
  useEffect(() => {
    let cancelled = false

    async function loadVenues() {
      setLoading(true)
      setError(null)

      try {
        // Start with static venues as immediate data
        const staticProps = mapStaticVenues()

        // Fetch Firebase approved venues
        const firestoreVenues = await getApprovedVenues()
        const firestoreProps = mapFirestoreVenues(firestoreVenues)

        if (!cancelled) {
          // Merge: Firebase venues first, then static venues that don't overlap
          const firestoreIds = new Set(firestoreProps.map((p) => p.id))
          const merged = [
            ...firestoreProps,
            ...staticProps.filter((p) => !firestoreIds.has(p.id)),
          ]
          setProperties(merged)
        }
      } catch (err) {
        console.error("Failed to load venues:", err)
        if (!cancelled) {
          // Fall back to static data on error
          setProperties(mapStaticVenues())
          setError("Live venues unavailable. Showing cached listings.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadVenues()
    return () => { cancelled = true }
  }, [])

  const toggleInArray = useCallback(
    (arr: string[], item: string) =>
      arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
    []
  )

  // Filtering (applies non-category filters to all properties)
  const applyNonCategoryFilters = useCallback((p: PropertyData) => {
    if (selectedCity !== "all" && p.location.toLowerCase() !== selectedCity.toLowerCase()) return false
    if (selectedAmenities.length > 0 && p.amenities) {
      const pAmenities = p.amenities.map((a) => a.toLowerCase())
      if (!selectedAmenities.some((a) => pAmenities.includes(a.toLowerCase()))) return false
    }
    if (minPrice && p.price < Number(minPrice)) return false
    if (maxPrice && p.price > Number(maxPrice)) return false
    if (minGuests && (p.maxGuests || 0) < Number(minGuests)) return false
    return true
  }, [selectedCity, selectedAmenities, minPrice, maxPrice, minGuests])

  const sortProperties = useCallback((arr: PropertyData[]) => {
    return [...arr].sort((a, b) => {
      if (sortBy === "recommended") {
        if (a.tag === "Popular" && b.tag !== "Popular") return -1;
        if (b.tag === "Popular" && a.tag !== "Popular") return 1;
        return 0;
      }
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating-high") return b.rating - a.rating;
      if (sortBy === "rating-low") return a.rating - b.rating;
      return 0;
    })
  }, [sortBy])

  // For specific category view
  const filteredProperties = properties.filter((p) => {
    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase()
      const badge = (p.badge || "").toLowerCase()
      let isMatch = badge === cat || badge + "s" === cat || badge === cat + "s"
      if (!isMatch) return false
    }
    return applyNonCategoryFilters(p)
  })

  const sortedFiltered = sortProperties(filteredProperties)

  // For "all" category slider view – group by category
  const isCategoryMatch = (badge: string, cat: string) => {
    const b = badge.toLowerCase()
    const c = cat.toLowerCase()
    return b === c || b + "s" === c || b === c + "s"
  }

  const housesItems = sortProperties(properties.filter(p => isCategoryMatch(p.badge || "", "Houses") && applyNonCategoryFilters(p)))
  const birthdayItems = sortProperties(properties.filter(p => isCategoryMatch(p.badge || "", "Birthday Centers") && applyNonCategoryFilters(p)))
  const spacesItems = sortProperties(properties.filter(p => isCategoryMatch(p.badge || "", "Spaces") && applyNonCategoryFilters(p)))

  const isAllCategories = selectedCategory === "all"
  const isBirthdayCategory = selectedCategory.toLowerCase() === "birthday centers"

  const totalPages = isAllCategories ? 1 : Math.max(1, Math.ceil(sortedFiltered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProperties = isAllCategories ? sortedFiltered : sortedFiltered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedAmenities, selectedCity, selectedCategory, minPrice, maxPrice, minGuests, sortBy])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="houses-page-wrapper">
      <Header />

      {/* Spacer for fixed header */}
      <div style={{ height: 72 }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroBanner />

      {/* ── Sticky Top Filter Bar ─────────────────────────── */}
      <FilterBar
        selectedAmenities={selectedAmenities}
        onToggleAmenity={(amenity) => setSelectedAmenities((prev) => toggleInArray(prev, amenity))}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        minGuests={minGuests}
        onMinGuestsChange={setMinGuests}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearAll={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── Content ─────────────────────────────────────── */}
      <div className="houses-layout">

        <div className="houses-content">
          {!isAllCategories && (
            <div className="houses-content__header">
              <span className="houses-content__count">
                {loading ? "Loading…" : `${sortedFiltered.length} ${sortedFiltered.length === 1 ? "property" : "properties"} found`}
              </span>
            </div>
          )}

          {error && (
            <div style={{ padding: "10px 14px", marginBottom: 16, background: "#faeeda", borderRadius: 8, fontSize: 13, color: "#633806" }}>
              {error}
            </div>
          )}

          {loading ? (
            <SkeletonGrid />
          ) : isAllCategories ? (
            /* ── ALL CATEGORIES: 3 Horizontal Sliders ── */
            <div>
              <CategorySlider
                title="Houses"
                items={housesItems}
                cardType="house"
                onSeeAll={() => setSelectedCategory("Houses")}
              />
              <CategorySlider
                title="Birthday Centers"
                items={birthdayItems}
                cardType="birthday"
                onSeeAll={() => setSelectedCategory("Birthday Centers")}
              />
              <CategorySlider
                title="Spaces"
                items={spacesItems}
                cardType="house"
                onSeeAll={() => setSelectedCategory("Spaces")}
              />
              {housesItems.length === 0 && birthdayItems.length === 0 && spacesItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-transparent">
                  <p className="text-xl font-bold text-[#26215c] mb-2">No venues match your filters</p>
                  <p className="text-[14px] text-[#534ab7]">Try adjusting your filters</p>
                </div>
              )}
            </div>
          ) : isBirthdayCategory ? (
            /* ── BIRTHDAY CENTERS: Stacked horizontal cards ── */
            paginatedProperties.length > 0 ? (
              <div className="flex flex-col gap-6" id="houses-grid">
                {paginatedProperties.map((property) => (
                  <BirthdayCenterCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-transparent">
                <p className="text-xl font-bold text-[#26215c] mb-2">No venues match your filters</p>
                <p className="text-[14px] text-[#534ab7]">Try adjusting your filters</p>
              </div>
            )
          ) : (
            /* ── HOUSES / SPACES: Standard grid ── */
            paginatedProperties.length > 0 ? (
              <div className="houses-grid" id="houses-grid">
                {paginatedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-transparent">
                <p className="text-xl font-bold text-[#26215c] mb-2">No venues match your filters</p>
                <p className="text-[14px] text-[#534ab7]">Try adjusting your filters</p>
              </div>
            )
          )}

          {!isAllCategories && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>



      {/* ── Footer ──────── */}
      <Footer hideListYourSpace housesVariant={true} />
    </main>
  )
}
