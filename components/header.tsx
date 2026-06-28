"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { LanguageSwitcher } from "./languageSwitcher"
import { MobileBottomNav, DesktopNavbar } from "./mobileBottomNav"
import { AuthUserMenu } from "./authUserMenu"
import { AuthModal } from "./authModal"
import { NotificationBell } from "./NotificationBell"


function OldHeader() {
  const [isMobile, setIsMobile] = useState(false)
  const [isOverDarkSection, setIsOverDarkSection] = useState(false)
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const { t } = useLanguage()
  const { user, loading, logout, isAdmin } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!isMobile) return

    const howItWorksSection = document.getElementById("how-it-works")
    if (!howItWorksSection) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverDarkSection(entry.isIntersecting)
      },
      {
        rootMargin: "-64px 0px -100% 0px",
        threshold: 0
      }
    )

    observer.observe(howItWorksSection)
    return () => observer.disconnect()
  }, [isMobile])

  const textColor = isOverDarkSection ? "#ffffff" : undefined
  const bgStyle = isOverDarkSection
    ? {
      background: "rgba(30, 30, 35, 0.85)",
      backdropFilter: "blur(22px) saturate(160%)",
      WebkitBackdropFilter: "blur(22px) saturate(160%)",
      boxShadow: "0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0.5px 0 rgba(255, 255, 255, 0.15)",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
      transition: "background-color 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
    }
    : {
      background: "rgba(255, 255, 255, 0.12)",
      backdropFilter: "blur(22px) saturate(160%)",
      WebkitBackdropFilter: "blur(22px) saturate(160%)",
      boxShadow: "0 1px 0 rgba(0, 0, 0, 0.03), inset 0 0.5px 0 rgba(255, 255, 255, 0.4)",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      transition: "background-color 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
    }

  return (
    <>
      {isMobile && (
        <header className="fixed z-10 top-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full pointer-events-auto" style={bgStyle}>
            <div
              className="flex items-center justify-between px-4 h-16 gap-3"
              style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", width: "100%" }}
            >
              <Link
                href="/"
                className="flex-shrink-0 flex items-center"
                style={{ color: textColor || "#534ab7", transition: "color 0.4s ease" }}
              >
                <svg viewBox="0 0 350 43.594424264186074" className="h-6 sm:h-7 w-auto looka-1j8o68f"><defs id="SvgjsDefs1978"></defs><g id="SvgjsG1979" featureKey="K5GtsI-0" transform="matrix(3.1138785385639025,0,0,3.1138785385639025,-2.8024894968571177,-15.942930067174638)" fill="currentColor"><path d="M17.46 11.44 l-15.44 0 l0 -4.88 l15.44 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 l-16.56 0 l0 12.56 c0 0.37334 0.18666 0.56 0.56 0.56 s0.56 -0.18666 0.56 -0.56 l0 -5.44 l15.44 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 z M35.88 12.56 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 l-15.44 0 l0 -4.88 l15.44 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 l-16.56 0 l0 13.12 l16.56 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 l-15.44 0 l0 -4.88 l15.44 0 z M38.06 14 c0 1.37334 0.82666 2.52996 2.48 3.46996 s3.68 1.41 6.08 1.41 c2.38666 0 4.33332 -0.26 5.83998 -0.78 c1.81334 -0.62666 2.72 -1.54666 2.72 -2.76 c0 -1.26666 -0.77334 -2.18 -2.32 -2.74 c-0.88 -0.32 -2.59334 -0.65334 -5.14 -1 l-1.98 -0.28 c-2.41334 -0.34666 -4.01334 -0.65332 -4.8 -0.91998 c-1.17334 -0.4 -1.76 -0.98 -1.76 -1.74 c0 -0.72 0.69334 -1.30666 2.08 -1.76 s3.17332 -0.68 5.35998 -0.68 c2.01334 0 3.75668 0.37334 5.23002 1.12 s2.21 1.63332 2.21 2.65998 l0 0 c0 0.37334 0.18666 0.56 0.56 0.56 s0.56 -0.18666 0.56 -0.56 l0 0 c0 -1.37334 -0.82666 -2.53 -2.48 -3.47 s-3.68 -1.41 -6.08 -1.41 c-2.38666 0 -4.33332 0.26 -5.83998 0.78 c-1.81334 0.62666 -2.72 1.54666 -2.72 2.76 c0 1.26666 0.80666 2.18666 2.42 2.76 c0.77334 0.26666 2.48 0.6 5.12 1 l0.94 0.14 l1.02 0.14 c2.44 0.33334 4.06 0.64 4.86 0.92 c1.09334 0.37334 1.64 0.94668 1.64 1.72002 c0 0.72 -0.69334 1.30666 -2.08 1.76 s-3.17332 0.68 -5.35998 0.68 c-2.01334 0 -3.75668 -0.37334 -5.23002 -1.12 s-2.21 -1.63332 -2.21 -2.65998 l0 0 c0 -0.37334 -0.18666 -0.56 -0.56 -0.56 s-0.56 0.18666 -0.56 0.56 z M72.96 5.44 l-16 0 c-0.37334 0 -0.56 0.18666 -0.56 0.56 s0.18666 0.56 0.56 0.56 l7.44 0 l0 11.44 c0 0.37334 0.18666 0.56 0.56 0.56 s0.56 -0.18666 0.56 -0.56 l0 -11.44 l7.44 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 z M74.82 6.12 l0 12 c0 0.36 0.18 0.54 0.54 0.54 c0.37334 0 0.56 -0.18 0.56 -0.54 l0 0 l0 -12 c0 -0.37334 -0.18666 -0.56 -0.56 -0.56 c-0.36 0 -0.54 0.18666 -0.54 0.56 z M93.92 5.54 c-0.21334 0 -0.37334 0.08666 -0.48 0.26 l-7.52 11.3 l-7.54 -11.3 c-0.10666 -0.17334 -0.26666 -0.26 -0.48 -0.26 c-0.37334 0 -0.56 0.19334 -0.56 0.58 c0 0.10666 0.03334 0.20666 0.1 0.3 l8.48 12.7 l8.46 -12.7 c0.06666 -0.09334 0.1 -0.2 0.1 -0.32 c0 -0.37334 -0.18666 -0.56 -0.56 -0.56 z M104.42 5.22 c-2.42666 0 -4.50664 0.66 -6.23998 1.98 c-1.77334 1.34666 -2.66 2.98666 -2.66 4.92 s0.88666 3.57334 2.66 4.92 c1.72 1.30666 3.8 1.96 6.24 1.96 s4.51334 -0.65334 6.22 -1.96 c1.77334 -1.36 2.66 -3 2.66 -4.92 s-0.88666 -3.56 -2.66 -4.92 c-1.73334 -1.32 -3.80668 -1.98 -6.22002 -1.98 z M112.20002 12.12 c0 1.58666 -0.76 2.94332 -2.28 4.06998 s-3.35334 1.69 -5.5 1.69 s-3.98 -0.56334 -5.5 -1.69 s-2.28 -2.48332 -2.28 -4.06998 c0 -1.6 0.76 -2.96334 2.28 -4.09 s3.35334 -1.69 5.5 -1.69 s3.98 0.56334 5.5 1.69 s2.28 2.49 2.28 4.09 z"></path></g></svg>
              </Link>

              <div className={`flex items-center flex-shrink-0`} style={{ gap: !loading && user ? "4px" : "8px", width: !loading && user ? "auto" : "auto" }}>
                <LanguageSwitcher variant="navbar" isOverDarkSection={isOverDarkSection} />
                <div style={{ width: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end", height: "48px" }}>
                  {!loading ? (
                    user ? (
                      <>
                        <div className="hidden sm:flex flex-col items-end min-w-0 flex-1 pr-2">
                          <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: textColor }}>
                            {user.displayName || user.email?.split("@")[0]}
                          </p>
                          {isAdmin && (
                            <p className="text-xs text-accent font-medium">Admin</p>
                          )}
                        </div>
                        <AuthUserMenu variant="mobile" />
                      </>
                    ) : (
                      <button
                        onClick={() => setAuthModalOpen(true)}
                        className="font-bold rounded-full hover:opacity-90 whitespace-nowrap transition-opacity duration-300 cursor-pointer inline-flex items-center justify-center"
                        style={{
                          backgroundColor: isOverDarkSection ? "#ffffff" : "var(--foreground)",
                          color: isOverDarkSection ? "#26215c" : "var(--background)",
                          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15)",
                          transition: "background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, opacity 0.3s ease",
                          paddingLeft: "16px",
                          paddingRight: "16px",
                          paddingTop: "8px",
                          paddingBottom: "8px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.75rem",
                        }}
                      >
                        {t.header.signIn}
                      </button>
                    )
                  ) : (
                    <div style={{ width: "40px", height: "40px" }} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
        </header>
      )}

      <MobileBottomNav />

      <DesktopNavbar user={user} loading={loading} logout={logout} isAdmin={isAdmin} />
    </>
  )
}

function NewHeader() {
  const [isMobile, setIsMobile] = useState(false)
  const currentPath = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const { t } = useLanguage()
  const { user, loading, logout, isAdmin } = useAuth()

  const [scrollDir, setScrollDir] = useState<"up" | "down">("up")

  useEffect(() => {
    let lastScrollY = window.scrollY
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 20)

      if (currentScrollY > lastScrollY && currentScrollY > 64) {
        setScrollDir("down")
      } else if (currentScrollY < lastScrollY) {
        setScrollDir("up")
      }
      lastScrollY = currentScrollY
    }

    checkMobile()
    handleScroll()

    window.addEventListener("resize", checkMobile)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 pointer-events-auto translate-y-0"
        style={{
          padding: scrollDir === "down" && scrolled ? "6px 0" : scrolled ? "8px 0" : "14px 0",
          background: scrolled
            ? "rgba(255, 255, 255, 0.92)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "blur(24px)",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "blur(24px)",
          boxShadow: scrolled
            ? "0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)"
            : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.04)" : "1px solid transparent",
          transition: "padding 250ms ease, background 250ms ease, box-shadow 250ms ease, border-color 250ms ease, backdrop-filter 250ms ease",
        }}
      >
        <div className="w-full max-w-[1600px] min-[1700px]:max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between md:grid md:grid-cols-3 items-center">

          {/* Left: Links (Desktop only) */}
          <div className="hidden md:flex items-center justify-start">
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-1 min-[1440px]:gap-1.5 bg-[#f7f6fd] rounded-[14px] px-1.5 py-1">
                {[
                  { href: "/", label: "Home" },
                  { href: "/browse", label: "Venues" },
                  { href: "/list-your-space", label: "List Your Space" },
                  { href: "/about", label: "About" },
                ].map((link) => {
                  const isActive = currentPath === link.href

                  if (link.href === "/list-your-space" && !user && !loading) {
                    return (
                      <button
                        key={link.href}
                        onClick={() => setAuthModalOpen(true)}
                        className={`relative px-4 py-2 rounded-[10px] text-[12.5px] font-semibold transition-all duration-300 cursor-pointer ${isActive
                          ? "bg-[#26215c] text-[rgba(255,255,255,0.95)] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                          : "text-[#534ab7] hover:text-[#26215c] hover:bg-[#7f77dd]/10"
                          }`}
                      >
                        {link.label}
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative px-4 py-2 rounded-[10px] text-[12.5px] font-semibold transition-all duration-300 ${isActive
                        ? "bg-[#26215c] text-[rgba(255,255,255,0.95)] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                        : "text-[#534ab7] hover:text-[#26215c] hover:bg-[#7f77dd]/10"
                        }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>

          {/* Center: Logo */}
          <div className="flex items-center justify-center">
            <Link href="/" className="text-[#26215c] flex-shrink-0 flex items-center transition-transform duration-250" style={{ transform: scrollDir === "down" && scrolled ? "scale(0.92)" : "scale(1)" }}>
              <svg viewBox="0 0 350 43.594424264186074" className="h-[22px] md:h-[26px] w-auto looka-1j8o68f"><defs id="SvgjsDefs1978"></defs><g id="SvgjsG1979" featurekey="K5GtsI-0" transform="matrix(3.1138785385639025,0,0,3.1138785385639025,-2.8024894968571177,-15.942930067174638)" fill="currentColor"><path d="M17.46 11.44 l-15.44 0 l0 -4.88 l15.44 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 l-16.56 0 l0 12.56 c0 0.37334 0.18666 0.56 0.56 0.56 s0.56 -0.18666 0.56 -0.56 l0 -5.44 l15.44 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 z M35.88 12.56 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 l-15.44 0 l0 -4.88 l15.44 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 l-16.56 0 l0 13.12 l16.56 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 l-15.44 0 l0 -4.88 l15.44 0 z M38.06 14 c0 1.37334 0.82666 2.52996 2.48 3.46996 s3.68 1.41 6.08 1.41 c2.38666 0 4.33332 -0.26 5.83998 -0.78 c1.81334 -0.62666 2.72 -1.54666 2.72 -2.76 c0 -1.26666 -0.77334 -2.18 -2.32 -2.74 c-0.88 -0.32 -2.59334 -0.65334 -5.14 -1 l-1.98 -0.28 c-2.41334 -0.34666 -4.01334 -0.65332 -4.8 -0.91998 c-1.17334 -0.4 -1.76 -0.98 -1.76 -1.74 c0 -0.72 0.69334 -1.30666 2.08 -1.76 s3.17332 -0.68 5.35998 -0.68 c2.01334 0 3.75668 0.37334 5.23002 1.12 s2.21 1.63332 2.21 2.65998 l0 0 c0 0.37334 0.18666 0.56 0.56 0.56 s0.56 -0.18666 0.56 -0.56 l0 0 c0 -1.37334 -0.82666 -2.53 -2.48 -3.47 s-3.68 -1.41 -6.08 -1.41 c-2.38666 0 -4.33332 0.26 -5.83998 0.78 c-1.81334 0.62666 -2.72 1.54666 -2.72 2.76 c0 1.26666 0.80666 2.18666 2.42 2.76 c0.77334 0.26666 2.48 0.6 5.12 1 l0.94 0.14 l1.02 0.14 c2.44 0.33334 4.06 0.64 4.86 0.92 c1.09334 0.37334 1.64 0.94668 1.64 1.72002 c0 0.72 -0.69334 1.30666 -2.08 1.76 s-3.17332 0.68 -5.35998 0.68 c-2.01334 0 -3.75668 -0.37334 -5.23002 -1.12 s-2.21 -1.63332 -2.21 -2.65998 l0 0 c0 -0.37334 -0.18666 -0.56 -0.56 -0.56 s-0.56 0.18666 -0.56 0.56 z M72.96 5.44 l-16 0 c-0.37334 0 -0.56 0.18666 -0.56 0.56 s0.18666 0.56 0.56 0.56 l7.44 0 l0 11.44 c0 0.37334 0.18666 0.56 0.56 0.56 s0.56 -0.18666 0.56 -0.56 l0 -11.44 l7.44 0 c0.37334 0 0.56 -0.18666 0.56 -0.56 s-0.18666 -0.56 -0.56 -0.56 z M74.82 6.12 l0 12 c0 0.36 0.18 0.54 0.54 0.54 c0.37334 0 0.56 -0.18 0.56 -0.54 l0 0 l0 -12 c0 -0.37334 -0.18666 -0.56 -0.56 -0.56 c-0.36 0 -0.54 0.18666 -0.54 0.56 z M93.92 5.54 c-0.21334 0 -0.37334 0.08666 -0.48 0.26 l-7.52 11.3 l-7.54 -11.3 c-0.10666 -0.17334 -0.26666 -0.26 -0.48 -0.26 c-0.37334 0 -0.56 0.19334 -0.56 0.58 c0 0.10666 0.03334 0.20666 0.1 0.3 l8.48 12.7 l8.46 -12.7 c0.06666 -0.09334 0.1 -0.2 0.1 -0.32 c0 -0.37334 -0.18666 -0.56 -0.56 -0.56 z M104.42 5.22 c-2.42666 0 -4.50664 0.66 -6.23998 1.98 c-1.77334 1.34666 -2.66 2.98666 -2.66 4.92 s0.88666 3.57334 2.66 4.92 c1.72 1.30666 3.8 1.96 6.24 1.96 s4.51334 -0.65334 6.22 -1.96 c1.77334 -1.36 2.66 -3 2.66 -4.92 s-0.88666 -3.56 -2.66 -4.92 c-1.73334 -1.32 -3.80668 -1.98 -6.22002 -1.98 z M112.20002 12.12 c0 1.58666 -0.76 2.94332 -2.28 4.06998 s-3.35334 1.69 -5.5 1.69 s-3.98 -0.56334 -5.5 -1.69 s-2.28 -2.48332 -2.28 -4.06998 c0 -1.6 0.76 -2.96334 2.28 -4.09 s3.35334 -1.69 5.5 -1.69 s3.98 0.56334 5.5 1.69 s2.28 2.49 2.28 4.09 z"></path></g></svg>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 md:gap-3 min-w-0 md:min-w-[150px]">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>



            {!loading ? (
              user ? (
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <AuthUserMenu variant="desktop" />
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center justify-center whitespace-nowrap font-bold bg-[#26215c] text-white rounded-md px-3.5 md:px-5 py-2 text-[12px] md:text-[12.5px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-black hover:shadow-[0_4px_14px_rgba(0,0,0,0.18)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              )
            ) : (
              <div className="w-[140px] h-[36px]" />
            )}
          </div>
        </div>
      </header>

      {isMobile && <MobileBottomNav />}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}

export function Header() {
  return <NewHeader />
}

