"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Home, Building2, PlusCircle, User } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { LanguageSwitcher } from "./languageSwitcher"
import { AuthUserMenu } from "./authUserMenu"
import { AuthModal } from "./authModal"
import { useLoadingContext } from "@/lib/loading-context"

type NavItem = {
  id: string
  targetId: string
  icon: React.ReactNode
  labelKey: "home" | "venues" | "listYourSpace"
}

const navItems: NavItem[] = [
  {
    id: "home",
    targetId: "#top",
    labelKey: "home",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    id: "venues",
    targetId: "/browse",
    labelKey: "venues",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: "list-space",
    targetId: "/list-your-space",
    labelKey: "listYourSpace",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
]

const sectionIds = ["top", "venues", "list-space"]

const SECTION_VISIBILITY_THRESHOLD = 200

const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
  mass: 1.2,
}

const glassSpringConfig = {
  type: "spring" as const,
  stiffness: 120,
  damping: 25,
  mass: 1.5,
}

interface GlassDockProps {
  activeIndex: number | null
  isAnimating: boolean
  tappedIndex: number | null
  onNavClick: (e: React.MouseEvent<HTMLButtonElement>, targetId: string, index: number) => void
  user?: { uid: string; email: string | null; displayName: string | null } | null
  loading?: boolean
  isAdmin?: boolean
}

function MobileGlassDock({ activeIndex, isAnimating, tappedIndex, onNavClick }: Omit<GlassDockProps, "variant">) {
  const { t } = useLanguage()
  const itemWidth = 100 / navItems.length
  const [hasAppeared, setHasAppeared] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHasAppeared(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const textColor = "rgba(0, 0, 0, 0.8)"
  const activeColor = "#26215c"
  const bgColor = "rgba(255, 255, 255, 0.85)"
  const pillBg = "rgba(0, 0, 0, 0.08)"
  const shadowColor =
    "0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.4)"

  const getLabel = (item: NavItem) => {
    return (t.header as any)[item.labelKey]
  }

  return (
    <>
      <motion.div
        className="absolute inset-0 -z-10 rounded-[40px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: hasAppeared ? 1 : 0 }}
        transition={glassSpringConfig}
        style={{
          background: "rgba(0, 0, 0, 0.03)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transform: "scale(1.05)",
        }}
      />

      <motion.div
        className="relative flex items-center justify-around px-3 py-2.5"
        initial={{
          borderRadius: 24,
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          borderRadius: hasAppeared ? 40 : 24,
          opacity: hasAppeared ? 1 : 0,
          scale: hasAppeared ? 1 : 0.95,
        }}
        whileTap={{
          borderRadius: 44,
          scale: 0.98,
        }}
        transition={glassSpringConfig}
        style={{
          background: bgColor,
          backdropFilter: `blur(${Math.max(0, hasAppeared ? 34 : 20)}px) saturate(180%)`,
          WebkitBackdropFilter: `blur(${Math.max(0, hasAppeared ? 34 : 20)}px) saturate(180%)`,
          boxShadow: shadowColor,
          border: `1px solid rgba(255, 255, 255, 0.4)`,
          width: "min(340px, 92vw)",
        }}
      >
        {activeIndex !== null && (
          <>
            {/* Chromatic glow - ROUND bubble */}
            <motion.div
              className="absolute top-1.5 bottom-1.5 rounded-full pointer-events-none"
              style={{
                width: `calc(${itemWidth}% - 6px)`,
                background: "linear-gradient(135deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.06) 50%, rgba(0, 0, 0, 0.05) 100%)",
              }}
              initial={{ opacity: 0, left: `calc(${activeIndex * itemWidth}% + 3px)` }}
              animate={{
                left: `calc(${activeIndex * itemWidth}% + 3px)`,
                scaleX: isAnimating ? 1.25 : 1,
                scaleY: isAnimating ? 0.85 : 1,
                filter: isAnimating ? "blur(6px)" : "blur(8px)",
                opacity: isAnimating ? 0.85 : 1,
              }}
              transition={{ ...springConfig, filter: { type: "tween", duration: 0.2 } }}
            />

            {/* Pill behind active item */}
            <motion.div
              className="absolute top-2 bottom-2 rounded-full"
              style={{
                width: `calc(${itemWidth}% - 10px)`,
                background: pillBg,
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08), inset 0 0.5px 0 rgba(255, 255, 255, 0.5)",
              }}
              initial={{ opacity: 0, left: `calc(${activeIndex * itemWidth}% + 5px)` }}
              animate={{
                left: `calc(${activeIndex * itemWidth}% + 5px)`,
                scaleX: isAnimating ? 1.25 : 1,
                scaleY: isAnimating ? 0.85 : 1,
                filter: isAnimating ? "blur(6px)" : "blur(0.01px)",
                opacity: isAnimating ? 0.8 : 1,
              }}
              transition={{ ...springConfig, filter: { type: "tween", duration: 0.2 } }}
            />
          </>
        )}

        {navItems.map((item, index) => {
          const isActive = activeIndex === index
          const isTapped = tappedIndex === index
          const label = getLabel(item)

          return (
            <button
              key={item.id}
              onClick={(e) => onNavClick(e, item.targetId, index)}
              className="relative z-10 flex flex-col items-center justify-center gap-0.5 py-1.5 flex-1 cursor-pointer"
              aria-label={label}
            >
              <AnimatePresence>
                {isTapped && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, rgba(0, 0, 0, 0.12) 0%, transparent 70%)`,
                    }}
                    initial={{ opacity: 0, scale: 0.5, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1.5, filter: "blur(0.01px)" }}
                    exit={{ opacity: 0, scale: 2, filter: "blur(3px)" }}
                    transition={{ duration: 0.3, ease: "easeOut", filter: { type: "tween", duration: 0.2 } }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
                transition={springConfig}
                style={{
                  color: isActive ? activeColor : textColor,
                }}
              >
                {item.icon}
              </motion.div>

              <motion.span
                className="text-[9px] font-semibold"
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                transition={springConfig}
                style={{
                  color: isActive ? activeColor : textColor,
                }}
              >
                {label}
              </motion.span>
            </button>
          )
        })}
      </motion.div>
    </>
  )
}

const desktopNavItems: NavItem[] = [
  {
    id: "home",
    targetId: "#top",
    labelKey: "home",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    id: "venues",
    targetId: "/browse",
    labelKey: "venues",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: "list-space",
    targetId: "/list-your-space",
    labelKey: "listYourSpace",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
]

type NavbarState = "initial" | "scrolled" | "expanded" | "compact"

function DesktopGlassDock({ activeIndex, isAnimating, tappedIndex, onNavClick, user, loading, isAdmin }: Omit<GlassDockProps, "variant"> & { isAdmin?: boolean }) {
  const { t } = useLanguage()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isHoverAnimating, setIsHoverAnimating] = useState(false)
  const itemWidth = 100 / desktopNavItems.length
  const desktopActiveIndex = activeIndex
  
  const displayIndex = hoveredIndex !== null ? hoveredIndex : desktopActiveIndex

  // Trigger jelly/stretch effect when highlighted index changes
  useEffect(() => {
    if (displayIndex !== null) {
      setIsHoverAnimating(true)
      const timer = setTimeout(() => setIsHoverAnimating(false), 400)
      return () => clearTimeout(timer)
    }
  }, [displayIndex])

  const displayAnimating = isAnimating || isHoverAnimating

  const textColor = "#26215c"
  const activeColor = "#26215c"

  const [navbarState, setNavbarState] = useState<NavbarState>("initial")
  const { isInitialLoading: globalInitialLoading } = useLoadingContext()
  const [hasLoaded, setHasLoaded] = useState(false)
  const lastScrollY = useRef(0)
  const accumulatedScrollUp = useRef(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isOverTestimonials, setIsOverTestimonials] = useState(false)
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)

  // Use IntersectionObserver to avoid getBoundingClientRect layout thrashing
  useEffect(() => {
    const section = document.getElementById("testimonials")
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverTestimonials(entry.isIntersecting)
      },
      {
        rootMargin: "-150px 0px -100px 0px", // Trigger slightly before it hits the threshold
        threshold: 0,
      }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // Initial load animation
  useEffect(() => {
    if (!globalInitialLoading) {
      const timer = setTimeout(() => setHasLoaded(true), 400)
      return () => clearTimeout(timer)
    } else {
      setHasLoaded(false)
    }
  }, [globalInitialLoading])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      
      ticking = true
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const delta = scrollY - lastScrollY.current
        
        // Check testimonials section
        if (isOverTestimonials && activeIndex === 2) {
          if (navbarState !== "expanded") setNavbarState("expanded")
          lastScrollY.current = scrollY
          ticking = false
          return
        }

        // Threshold-based state triggers
        if (scrollY > 120) {
          if (delta > 0) {
            // Scrolling down
            accumulatedScrollUp.current = 0
            if (navbarState !== "compact") {
              setNavbarState("compact")
            }
          } else {
            // Scrolling up
            accumulatedScrollUp.current += Math.abs(delta)
            if (accumulatedScrollUp.current > 80) {
              if (navbarState !== "initial") {
                setNavbarState("initial")
              }
            }
          }
        } else {
          // Near top of page
          if (navbarState !== "initial") {
            setNavbarState("initial")
          }
          accumulatedScrollUp.current = 0
        }

        lastScrollY.current = scrollY
        ticking = false
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [navbarState, isOverTestimonials, activeIndex])

  const isExpanded = navbarState === "expanded"
  const isInitial  = navbarState === "initial" && hasLoaded
  const isCompact  = navbarState === "compact"
  const isOverReviews = false

  const isLoggedOut = !loading && !user
  const currentGap = isExpanded ? 12 : isInitial ? 10 : 8
  const currentPaddingX = isExpanded ? 20 : isInitial ? (isLoggedOut ? 32 : 28) : 12
  const paddingTop = isCompact ? 48 : 10
  const paddingBottom = isCompact ? 10 : 10
  const currentRadius = isExpanded ? 18 : isInitial ? 22 : 24

  const navListVariants = {
    hidden: { 
      opacity: 0,
      paddingLeft: 0,
      paddingRight: 0,
      gap: 0,
    },
    visible: {
      opacity: 1,
      paddingLeft: currentPaddingX,
      paddingRight: currentPaddingX,
      gap: currentGap,
      y: 0,
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.4,
        paddingLeft: { type: "spring", stiffness: 300, damping: 30 },
        paddingRight: { type: "spring", stiffness: 300, damping: 30 },
        gap: { type: "spring", stiffness: 300, damping: 30 },
      },
    },
    compact: {
      opacity: 1,
      y: 0, // Children should NOT move relative to parent
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    }
  }

  // Million-dollar spring physics
  const luxurySpring = {
    type: "spring" as const,
    stiffness: 110,
    damping: 22,
    mass: 1.2
  }

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 0,
      paddingRight: 0,
      gap: 0,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: currentPaddingX,
      paddingRight: currentPaddingX,
      gap: currentGap,
      transition: {
        ...luxurySpring,
        staggerChildren: 0.1,
        delayChildren: 0.4,
      }
    },
    compact: {
      opacity: 1,
      y: "-64%",
      paddingTop: 62,
      paddingBottom: 10,
      paddingLeft: currentPaddingX,
      paddingRight: currentPaddingX,
      gap: currentGap,
      transition: luxurySpring
    }
  }

  const navItemVariants = {
    hidden: { scale: 0, opacity: 0, y: 10 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
    compact: {
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
  }

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible Hover Zone for easier trigger when compact */}
      {isCompact && (
        <div className="absolute top-0 left-[-50vw] right-[-50vw] h-20 -z-20" />
      )}
      
      <motion.div
        className="relative flex items-center"
        initial="hidden"
        animate={hasLoaded ? (isCompact && !isHovered ? "compact" : "visible") : "hidden"}
        variants={containerVariants}
      >
      {/* Restore Control (Arrow Button) */}
      <AnimatePresence>
        {(isCompact && !isHovered) && (
          <motion.button
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ ...luxurySpring, damping: 18 }}
            onClick={() => setNavbarState("initial")}
            className="absolute top-full left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-5 rounded-b-[18px] z-20 cursor-pointer border-l border-r border-b border-white/40"
            style={{
              background: "rgba(247, 246, 243, 0.78)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
            }}
          >
            <svg className="w-3 h-3 text-[#26215c] mb-[1px] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
      {/* Background Pill */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: hasLoaded ? 1 : 0, 
          opacity: hasLoaded ? 1 : 0,
          borderRadius: hasLoaded ? currentRadius : 50,
        }}
        transition={luxurySpring}
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          boxShadow: isCompact 
            ? "0 10px 30px -10px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255, 255, 255, 0.4)"
            : "0 12px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          willChange: "background-color"
        }}
      />

      {/* 1. FESTIVO Logo (0.4s) */}
      <motion.button
        variants={navItemVariants}
        transition={{ ...navItemVariants.visible.transition, delay: 0.4 }}
        onClick={(e) => onNavClick(e, "#top", 0)}
        className="relative font-black tracking-tight px-2 py-1 flex-shrink-0 cursor-pointer"
        style={{ color: "#26215c", fontSize: "1.25rem" }}
        animate={{
          letterSpacing: isExpanded ? "-0.02em" : "-0.01em",
        }}
      >
        <span>FESTIVO</span>
      </motion.button>

      {/* 2. Divider (0.5s) */}
      <motion.div
        variants={navItemVariants}
        transition={{ ...navItemVariants.visible.transition, delay: 0.5 }}
        className="mx-0.5 h-5"
        animate={{
          opacity: isExpanded ? 0.2 : 0.15,
        }}
        style={{ width: 1, background: "rgba(30, 30, 30, 0.15)" }}
      />

      {/* 3. Main Nav Wrapper (Starts 0.6s) */}
      <motion.div
        variants={navItemVariants}
        transition={{ ...navItemVariants.visible.transition, delay: 0.6 }}
        className="flex items-center justify-around relative"
        animate={{
          width: isExpanded ? 320 : isInitial ? 300 : 260,
        }}
      >
        {displayIndex !== null && (
          <>
            <motion.div
              className="absolute top-0 bottom-0 rounded-full pointer-events-none"
              style={{
                width: `calc(${itemWidth}% + 8px)`,
                background: isOverReviews
                  ? "linear-gradient(135deg, rgba(255, 200, 50, 0.2) 0%, rgba(255, 180, 50, 0.15) 50%, rgba(255, 220, 100, 0.18) 100%)"
                  : "linear-gradient(135deg, rgba(120, 137, 168, 0.15) 0%, rgba(120, 137, 168, 0.1) 50%, rgba(120, 137, 168, 0.12) 100%)",
                filter: "blur(12px)",
              }}
              initial={{ opacity: 0, left: `calc(${displayIndex * itemWidth}% - 4px)` }}
              animate={{
                left: `calc(${displayIndex * itemWidth}% - 4px)`,
                scaleX: displayAnimating ? 1.3 : 1,
                scaleY: displayAnimating ? 0.8 : 1,
                opacity: displayAnimating ? 0.9 : 1,
              }}
              transition={springConfig}
            />

            <motion.div
              className="absolute top-1 bottom-1 rounded-full"
              style={{
                width: `calc(${itemWidth}% - 4px)`,
                background: isOverReviews ? "rgba(255, 200, 50, 0.12)" : "rgba(120, 137, 168, 0.08)",
                boxShadow: "0 2px 12px rgba(120, 137, 168, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                border: "1px solid rgba(120, 137, 168, 0.15)",
              }}
              initial={{ opacity: 0, left: `calc(${displayIndex * itemWidth}% + 2px)` }}
              animate={{
                left: `calc(${displayIndex * itemWidth}% + 2px)`,
                scaleX: displayAnimating ? 1.3 : 1,
                scaleY: displayAnimating ? 0.8 : 1,
                opacity: displayAnimating ? 0.85 : 1,
              }}
              transition={springConfig}
            />
          </>
        )}

        {desktopNavItems.map((item, index) => {
          const isActive = desktopActiveIndex === index
          const isTapped = tappedIndex === index + 1
          const label = (t.header as any)[item.labelKey]

          return (
            <motion.button
              key={item.id}
              variants={navItemVariants}
              transition={{ ...navItemVariants.visible.transition, delay: 0.7 + index * 0.1 }}
              onClick={(e) => onNavClick(e, item.targetId, index + 1)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative z-10 flex flex-col items-center justify-center gap-0.5 py-1.5 flex-1 cursor-pointer"
              aria-label={label}
            >
              <AnimatePresence>
                {isTapped && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, rgba(0, 122, 255, 0.25) 0%, transparent 70%)`,
                    }}
                    initial={{ opacity: 0, scale: 0.5, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1.5, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 2, filter: "blur(3px)" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={{
                  scale: isActive ? (isExpanded ? 1.2 : isInitial ? 1.1 : 1.05) : isExpanded ? 1 : isInitial ? 0.95 : 0.85,
                }}
                transition={springConfig}
                style={{
                  color: isActive ? activeColor : textColor,
                }}
              >
                {item.icon}
              </motion.div>

              <motion.span
                className="font-bold whitespace-nowrap text-xs"
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                transition={springConfig}
                style={{
                  color: isActive ? activeColor : "#26215c",
                  fontSize: "10px",
                }}
              >
                {label}
              </motion.span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* 4. Second Divider (Sequential after buttons) */}
      <motion.div
        variants={navItemVariants}
        transition={{ ...navItemVariants.visible.transition, delay: 1.1 }}
        className="ml-3 mr-2.5 h-5"
        animate={{
          opacity: isExpanded ? 0.2 : 0.15,
        }}
        style={{ width: 1, background: "rgba(30, 30, 30, 0.15)" }}
      />

      {/* 5. Last Wrapper (Sequential final) */}
      <motion.div
        variants={navItemVariants}
        transition={{ ...navItemVariants.visible.transition, delay: 1.2 }}
        className={`flex items-center pl-0 flex-shrink-0`} 
        style={{ width: "auto", justifyContent: "flex-start", gap: "8px" }}>
        <div style={{ color: "#26215c" }}>
          <LanguageSwitcher variant="navbar" />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", width: "auto", height: "48px" }}>
          {!loading ? (
            user ? (
              <AuthUserMenu variant="desktop" />
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="font-bold rounded-full hover:opacity-90 whitespace-nowrap transition-opacity duration-300 cursor-pointer inline-flex items-center justify-center"
                style={{
                  backgroundColor: "#26215c",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15)",
                  transition: "background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, opacity 0.3s ease",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  fontSize: "1rem",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {t.header.signIn}
              </button>
            )
          ) : (
            <div style={{ width: "120px", height: "48px" }} />
          )}
        </div>
      </motion.div>
      </motion.div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}

function useDockState() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [tappedIndex, setTappedIndex] = useState<number | null>(null)
  const [isManualScroll, setIsManualScroll] = useState(false)

  useEffect(() => {
    let ticking = false
    
    const handleScrollSpy = () => {
      if (isManualScroll || ticking) return
      
      ticking = true
      window.requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + window.innerHeight / 3

        if (scrollPosition < 300) {
          if (activeIndex !== 0) {
            setActiveIndex(0)
            setIsAnimating(true)
            setTimeout(() => setIsAnimating(false), 400)
          }
          ticking = false
          return
        }

        for (let i = sectionIds.length - 1; i >= 1; i--) {
          const section = document.getElementById(sectionIds[i])
          if (section) {
            const sectionTop = section.offsetTop
            if (scrollPosition >= sectionTop + SECTION_VISIBILITY_THRESHOLD) {
              if (activeIndex !== i) {
                setActiveIndex(i)
                setIsAnimating(true)
                setTimeout(() => setIsAnimating(false), 400)
              }
              ticking = false
              return
            }
          }
        }

        if (activeIndex !== 0) {
          setActiveIndex(0)
          setIsAnimating(true)
          setTimeout(() => setIsAnimating(false), 400)
        }
        ticking = false
      })
    }

    window.addEventListener("scroll", handleScrollSpy, { passive: true })
    handleScrollSpy()

    return () => window.removeEventListener("scroll", handleScrollSpy)
  }, [activeIndex, isManualScroll])

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, targetId: string, index: number) => {
    e.preventDefault()

    setTappedIndex(index)
    setTimeout(() => setTappedIndex(null), 250)

    // Handle page navigation
    if (targetId.startsWith("/")) {
      router.push(targetId)
      return
    }

    setIsManualScroll(true)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 400)
    setActiveIndex(index)

    setTimeout(() => setIsManualScroll(false), 1000)

    if (targetId === "#top") {
      if (window.location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        router.push("/")
      }
    } else if (targetId !== "#") {
      const element = document.querySelector(targetId)
      if (element) {
        const elementTop = element.getBoundingClientRect().top + window.scrollY
        const offset = 100
        window.scrollTo({ top: elementTop - offset, behavior: "smooth" })
      }
    }
  }, [router])

  return { activeIndex, isAnimating, tappedIndex, handleNavClick }
}

type MobileTab = {
  id: string
  href: string
  icon: typeof Home
  getLabel: (t: any, language: string, isLoggedIn: boolean) => string
  isActive: (pathname: string) => boolean
}

const mobileTabs: MobileTab[] = [
  {
    id: "home",
    href: "/",
    icon: Home,
    getLabel: (t) => t.header.home,
    isActive: (p) => p === "/",
  },
  {
    id: "venues",
    href: "/browse",
    icon: Building2,
    getLabel: (t) => t.header.venues,
    isActive: (p) => p.startsWith("/browse") || p.startsWith("/venues") || p.startsWith("/houses"),
  },
  {
    id: "list",
    href: "/list-your-space",
    icon: PlusCircle,
    getLabel: (_t, language) => (language === "ka" ? "დამატება" : "List"),
    isActive: (p) => p.startsWith("/list-your-space"),
  },
  {
    id: "account",
    href: "/profile",
    icon: User,
    getLabel: (t, language, isLoggedIn) =>
      isLoggedIn ? (language === "ka" ? "ჩემი" : "Account") : t.header.signIn,
    isActive: (p) => p.startsWith("/profile"),
  },
]

export function MobileBottomNav() {
  const pathname = usePathname() || "/"
  const { t, language } = useLanguage()
  const { user, loading } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  const isLoggedIn = !loading && !!user

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#ece9fb] shadow-[0_-6px_24px_rgba(38,33,92,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <ul className="flex items-stretch justify-around px-2 pt-1.5 pb-1.5">
          {mobileTabs.map((tab) => {
            const active = tab.isActive(pathname)
            const label = tab.getLabel(t, language, isLoggedIn)
            const Icon = tab.icon
            const needsAuth = tab.id === "account" && !isLoggedIn

            const inner = (
              <span className="relative flex flex-col items-center justify-center gap-1 py-1.5 w-full">
                {active && (
                  <motion.span
                    layoutId="mobileNavActivePill"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-1 w-7 rounded-full bg-[#26215c]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span
                  className={`flex items-center justify-center w-10 h-8 rounded-xl transition-colors duration-200 ${
                    active ? "bg-[#f1effb] text-[#26215c]" : "text-[#9b95dc]"
                  }`}
                >
                  <Icon className="w-[21px] h-[21px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className={`text-[10.5px] leading-none font-semibold tracking-tight transition-colors duration-200 ${
                    active ? "text-[#26215c]" : "text-[#9b95dc]"
                  }`}
                >
                  {label}
                </span>
              </span>
            )

            return (
              <li key={tab.id} className="flex-1">
                {needsAuth ? (
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="w-full cursor-pointer active:scale-95 transition-transform"
                    aria-label={label}
                  >
                    {inner}
                  </button>
                ) : (
                  <Link
                    href={tab.href}
                    className="block w-full active:scale-95 transition-transform"
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

interface DesktopNavbarProps {
  user?: { uid: string; email: string | null; displayName: string | null } | null
  loading?: boolean
  logout?: () => Promise<void>
  isAdmin?: boolean
}

export function DesktopNavbar({ user, loading, logout, isAdmin }: DesktopNavbarProps = {}) {
  const { activeIndex, isAnimating, tappedIndex, handleNavClick } = useDockState()

  return (
    <nav className="hidden md:flex fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <DesktopGlassDock
        activeIndex={activeIndex}
        isAnimating={isAnimating}
        tappedIndex={tappedIndex}
        onNavClick={handleNavClick}
        user={user}
        loading={loading}
        isAdmin={isAdmin}
      />
    </nav>
  )
}
