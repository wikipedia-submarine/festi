import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { getDb } from "./firestore"

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = "booking" | "payment" | "system"

export interface FirestoreNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: Timestamp | Date
}

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createNotification(
  params: CreateNotificationParams
): Promise<string> {
  try {
    const db = getDb()
    const notificationsRef = collection(db, "notifications")

    const notificationData = {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      ...(params.link ? { link: params.link } : {}),
      read: false,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(notificationsRef, notificationData)
    return docRef.id
  } catch (error) {
    console.error("[Notifications] Failed to create notification:", error)
    throw error
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getUserNotifications(
  userId: string
): Promise<FirestoreNotification[]> {
  const db = getDb()

  // Try sorted query first (requires composite index)
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as FirestoreNotification[]
  } catch (sortedError) {
    console.warn("[Notifications] Sorted query failed, trying fallback:", sortedError)
  }

  // Fallback: query without orderBy, sort client-side
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    )
    const querySnapshot = await getDocs(q)
    const notifications = querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as FirestoreNotification[]

    // Sort client-side: newest first
    return notifications.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as any).getTime()
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as any).getTime()
      return bTime - aTime
    })
  } catch (error) {
    console.error("[Notifications] Failed to fetch notifications:", error)
    return []
  }
}

// ─── Mark as Read ─────────────────────────────────────────────────────────────

export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  try {
    const db = getDb()
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, { read: true })
  } catch (error) {
    console.error("[Notifications] Failed to mark notification as read:", error)
  }
}

export async function markAllNotificationsRead(
  userId: string
): Promise<void> {
  try {
    const db = getDb()
    // Simple query without compound where — more compatible
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    )
    const snapshot = await getDocs(q)
    const unread = snapshot.docs.filter((d) => d.data().read === false)
    if (unread.length === 0) return

    const batch = writeBatch(db)
    unread.forEach((docSnap) => {
      batch.update(doc(db, "notifications", docSnap.id), { read: true })
    })
    await batch.commit()
  } catch (error) {
    console.error("[Notifications] Failed to mark all as read:", error)
  }
}
