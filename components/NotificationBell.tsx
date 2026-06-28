"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/useNotifications"
import { Timestamp } from "firebase/firestore"

// ─── Time formatting helper ──────────────────────────────────────────────────

function timeAgo(date: Timestamp | Date | undefined): string {
  if (!date) return ""
  const d = date instanceof Timestamp ? date.toDate() : new Date(date as any)
  if (isNaN(d.getTime())) return ""

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

// ─── Notification type icons (inline SVG, no external libs) ──────────────────

function TypeIcon({ type }: { type: string }) {
  if (type === "booking") {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
  if (type === "payment") {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead, refetch } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => {
      const willOpen = !prev
      if (willOpen) refetch()
      return willOpen
    })
  }, [refetch])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleNotificationClick = useCallback(
    async (notificationId: string, link?: string) => {
      await markRead(notificationId)
      if (link) {
        router.push(link)
        setIsOpen(false)
      }
    },
    [markRead, router]
  )

  const handleMarkAllRead = useCallback(async () => {
    await markAllRead()
  }, [markAllRead])

  return (
    <div ref={dropdownRef} className="relative" style={{ zIndex: 100 }}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={toggleDropdown}
        className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 cursor-pointer"
        style={{
          background: isOpen ? "rgba(38, 33, 92, 0.08)" : "transparent",
        }}
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#26215c"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute flex items-center justify-center rounded-full font-bold text-white"
            style={{
              top: 2,
              right: 2,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              fontSize: 10,
              backgroundColor: "#26215c",
              lineHeight: 1,
              boxShadow: "0 2px 6px rgba(38, 33, 92, 0.5)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 overflow-hidden"
          style={{
            width: 360,
            maxHeight: 440,
            borderRadius: 20,
            background: "#ffffff",
            border: "1px solid #cecbf6",
            boxShadow:
              "0 20px 60px rgba(38, 33, 92, 0.12), 0 4px 16px rgba(38, 33, 92, 0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #f0eef9" }}
          >
            <h3
              className="font-bold"
              style={{ fontSize: 15, color: "#26215c" }}
            >
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="font-semibold transition-colors cursor-pointer hover:underline"
                style={{ fontSize: 12, color: "#534ab7" }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 360 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="w-6 h-6 rounded-full animate-spin"
                  style={{
                    border: "2px solid #cecbf6",
                    borderTopColor: "#26215c",
                  }}
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <svg
                  className="w-10 h-10 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#cecbf6"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p
                  className="font-semibold"
                  style={{ fontSize: 14, color: "#534ab7" }}
                >
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.link)}
                  className="w-full text-left flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: n.read ? "transparent" : "#f7f6fd",
                    borderBottom: "1px solid #f0eef9",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = n.read
                      ? "#fafafe"
                      : "#efedf8"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = n.read
                      ? "transparent"
                      : "#f7f6fd"
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl mt-0.5"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor:
                        n.type === "booking"
                          ? "#efedf8"
                          : n.type === "payment"
                          ? "#e8f5e9"
                          : "#f0eef9",
                      color:
                        n.type === "booking"
                          ? "#26215c"
                          : n.type === "payment"
                          ? "#2e7d32"
                          : "#534ab7",
                    }}
                  >
                    <TypeIcon type={n.type} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="truncate"
                        style={{
                          fontSize: 13,
                          fontWeight: n.read ? 500 : 700,
                          color: "#26215c",
                        }}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span
                          className="flex-shrink-0 rounded-full"
                          style={{
                            width: 7,
                            height: 7,
                            backgroundColor: "#534ab7",
                          }}
                        />
                      )}
                    </div>
                    <p
                      className="line-clamp-2"
                      style={{
                        fontSize: 12,
                        color: "#534ab7",
                        lineHeight: 1.5,
                        marginTop: 2,
                      }}
                    >
                      {n.message}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#afa9ec",
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
