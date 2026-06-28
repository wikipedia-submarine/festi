"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type FirestoreNotification,
} from "@/lib/notifications"

const POLL_INTERVAL_MS = 30_000 // 30 seconds

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      const data = await getUserNotifications(user.uid)
      setNotifications(data)
    } catch (error) {
      console.error("[useNotifications] Failed to fetch:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications
    if (user) {
      intervalRef.current = setInterval(() => {
        fetchNotifications()
      }, POLL_INTERVAL_MS)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [fetchNotifications, user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = useCallback(
    async (notificationId: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      try {
        await markNotificationRead(notificationId)
      } catch (error) {
        console.error("[useNotifications] Failed to mark read:", error)
        // Revert on failure
        fetchNotifications()
      }
    },
    [fetchNotifications]
  )

  const markAllRead = useCallback(async () => {
    if (!user) return
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await markAllNotificationsRead(user.uid)
    } catch (error) {
      console.error("[useNotifications] Failed to mark all read:", error)
      fetchNotifications()
    }
  }, [user, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refetch: fetchNotifications,
  }
}
