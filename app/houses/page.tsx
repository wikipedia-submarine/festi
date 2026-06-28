"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ListYourSpace } from "@/components/listYourSpace"
import { Heart, Star, ChevronLeft, ChevronRight, Check, ChevronDown } from "lucide-react"
import { getApprovedVenues, type FirestoreVenue } from "@/lib/firestore-venues"
import { getImageFromFirestore } from "@/lib/cloud-storage"
import { staticVenuesData } from "@/lib/static-venues"
import { useLanguage } from "@/lib/language-context"
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

/** Convert static venue data into PropertyData */
function mapStaticVenues(): PropertyData[] {
  return staticVenuesData.map((sv) => ({
    id: String(sv.id),
    title: sv.description || sv.nameKey,
    location: sv.locationKey,
    price: sv.price,
    image: sv.image,
    rating: 4.8 + Math.random() * 0.2,
    badge: sv.premium ? "Villa" : "Apartment",
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
    rating: 4.7 + Math.random() * 0.3,
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
    <div className="houses-hero">
      <Image
        src="/images/HEADER2-12-Curacao-Villa-Wide-View-79---kopie.jpg"
        alt="Luxury villa in Curaçao"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover" }}
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

  return (
    <FeaturedVenueCard
      id={property.id}
      image={property.image}
      isPopular={property.tag === "Popular"}
      title={property.title}
      location={property.location}
      price={property.price}
      isGeorgian={isGeorgian}
      variant="compact"
      className="houses-card"
    />
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
//  FILTER SIDEBAR
// ═══════════════════════════════════════════════════════════

const PROPERTY_TYPES = ["Villa", "Apartment", "House"]
const AMENITIES = ["Pool", "WiFi", "Pet Friendly"]

const FilterSidebar = memo(function FilterSidebar({
  selectedTypes,
  onToggleType,
  selectedAmenities,
  onToggleAmenity,
  selectedCity,
  onCityChange,
  selectedCategory,
  onCategoryChange,
}: {
  selectedTypes: string[]
  onToggleType: (type: string) => void
  selectedAmenities: string[]
  onToggleAmenity: (amenity: string) => void
  selectedCity: string
  onCityChange: (city: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}) {
  return (
    <aside className="houses-sidebar" id="houses-filters">
      <h2 className="houses-sidebar__title">Filters</h2>

      {/* Category Dropdown */}
      <div className="houses-sidebar__section">
        <div className="houses-sidebar__section-title">Category</div>
        <div style={{ position: "relative" }}>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, outline: "none", color: "#26215c", background: "#f7f6fd", appearance: "none", cursor: "pointer" }}
          >
            <option value="all">All Categories</option>
            <option value="Villas">Villas</option>
            <option value="Apartments">Apartments</option>
            <option value="Rooftops">Rooftops</option>
            <option value="Studios">Studios</option>
          </select>
          <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#afa9ec", pointerEvents: "none" }} />
        </div>
      </div>

      {/* City Dropdown */}
      <div className="houses-sidebar__section">
        <div className="houses-sidebar__section-title">City</div>
        <div style={{ position: "relative" }}>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, outline: "none", color: "#26215c", background: "#f7f6fd", appearance: "none", cursor: "pointer" }}
          >
            <option value="all">All Cities</option>
            <option value="Tbilisi">Tbilisi</option>
            <option value="Batumi">Batumi</option>
            <option value="Kutaisi">Kutaisi</option>
            <option value="Kazbegi">Kazbegi</option>
            <option value="Borjomi">Borjomi</option>
          </select>
          <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#afa9ec", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Property Type */}
      <div className="houses-sidebar__section">
        <div className="houses-sidebar__section-title">Property Type</div>
        {PROPERTY_TYPES.map((type) => {
          const active = selectedTypes.includes(type)
          return (
            <div
              key={type}
              className={`houses-sidebar__item ${active ? "houses-sidebar__item--active" : ""}`}
              onClick={() => onToggleType(type)}
            >
              <div className="houses-sidebar__checkbox">
                {active && <Check style={{ width: 11, height: 11, color: "#fff", strokeWidth: 3 }} />}
              </div>
              <span className="houses-sidebar__item-label">{type}</span>
            </div>
          )
        })}
      </div>

      {/* Amenities */}
      <div className="houses-sidebar__section">
        <div className="houses-sidebar__section-title">Amenities</div>
        {AMENITIES.map((amenity) => {
          const active = selectedAmenities.includes(amenity)
          return (
            <div
              key={amenity}
              className={`houses-sidebar__item ${active ? "houses-sidebar__item--active" : ""}`}
              onClick={() => onToggleAmenity(amenity)}
            >
              <div className="houses-sidebar__checkbox">
                {active && <Check style={{ width: 11, height: 11, color: "#fff", strokeWidth: 3 }} />}
              </div>
              <span className="houses-sidebar__item-label">{amenity}</span>
            </div>
          )
        })}
      </div>

    </aside>
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
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function HousesPage() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "")
      if (hash) {
        const capitalized = hash.charAt(0).toUpperCase() + hash.slice(1).toLowerCase()
        const validCities = ["Tbilisi", "Batumi", "Kutaisi", "Kazbegi", "Borjomi"]
        if (validCities.includes(capitalized)) {
          setSelectedCity(capitalized)
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

  // Filtering
  const filteredProperties = properties.filter((p) => {
    if (selectedCategory !== "all" && p.badge !== selectedCategory) return false
    if (selectedCity !== "all" && p.location.toLowerCase() !== selectedCity.toLowerCase()) return false
    if (selectedTypes.length > 0 && !selectedTypes.includes(p.badge)) return false
    if (selectedAmenities.length > 0 && p.amenities) {
      const pAmenities = p.amenities.map((a) => a.toLowerCase())
      if (!selectedAmenities.some((a) => pAmenities.includes(a.toLowerCase()))) return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProperties = filteredProperties.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTypes, selectedAmenities, selectedCity, selectedCategory])

  return (
    <main className="houses-page-wrapper">
      <Header />

      {/* Spacer for fixed header */}
      <div style={{ height: 72 }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroBanner />

      {/* ── Two-Column Layout: Sidebar + Grid ────────────── */}
      <div className="houses-layout">
        <FilterSidebar
          selectedTypes={selectedTypes}
          onToggleType={(type) => setSelectedTypes((prev) => toggleInArray(prev, type))}
          selectedAmenities={selectedAmenities}
          onToggleAmenity={(amenity) => setSelectedAmenities((prev) => toggleInArray(prev, amenity))}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="houses-content">
          <div className="houses-content__header">
            <span className="houses-content__count">
              {loading ? "Loading…" : `${filteredProperties.length} ${filteredProperties.length === 1 ? "property" : "properties"} found`}
            </span>
            <button className="houses-content__sort">
              Sort by: Recommended
              <ChevronLeft style={{ width: 13, height: 13, transform: "rotate(-90deg)" }} />
            </button>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", marginBottom: 16, background: "#faeeda", borderRadius: 8, fontSize: 13, color: "#633806" }}>
              {error}
            </div>
          )}

          {loading ? (
            <SkeletonGrid />
          ) : paginatedProperties.length > 0 ? (
            <div className="houses-grid" id="houses-grid">
              {paginatedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#afa9ec", fontSize: 15 }}>
              No properties match your filters. Try adjusting your criteria.
            </div>
          )}

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ── List Your Space ──────── */}
      <div className="w-full pt-12 md:pt-16 pb-0">
        <ListYourSpace variant="dark" />
      </div>

      {/* ── Footer ──────── */}
      <Footer hideListYourSpace housesVariant={true} />
    </main>
  )
}
