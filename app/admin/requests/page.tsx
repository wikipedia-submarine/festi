"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Check, X, AlertCircle, Loader } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protectedRoute"
import { useLanguage } from "@/lib/language-context"
import { VenueEditModal } from "@/components/VenueEditModal"
import { approveVenue, rejectVenue, getPendingVenues, updateVenueAdmin, type FirestoreVenue } from "@/lib/firestore-venues"
import { getImageFromFirestore } from "@/lib/cloud-storage"

export default function AdminRequestsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminRequestsContent />
    </ProtectedRoute>
  )
}

function AdminRequestsContent() {
  const { t } = useLanguage()
  const { user, userProfile } = useAuth()
  const [venues, setVenues] = useState<FirestoreVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)
  const [editingVenue, setEditingVenue] = useState<FirestoreVenue | null>(null)

  useEffect(() => {
    loadPendingVenues()
  }, [])

  const loadPendingVenues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPendingVenues()
      
      // Resolve Firestore images for each venue
      const resolvedVenues = await Promise.all(data.map(async (venue) => {
        if (venue.images && venue.images.length > 0) {
          const resolvedImages = await Promise.all(venue.images.map(async (img) => {
            if (img.startsWith("firestore://")) {
              try {
                const imageId = img.replace("firestore://", "")
                const resolved = await getImageFromFirestore(imageId)
                return resolved || img
              } catch (e) {
                console.error(`Error resolving image ${img}:`, e)
                return img
              }
            }
            return img
          }))
          return { ...venue, images: resolvedImages }
        }
        return venue
      }))
      
      setVenues(resolvedVenues)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load pending requests"
      setError(errorMessage)
      console.error("Error loading requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (venueId: string) => {
    if (!user || !userProfile) return
    const venue = venues.find(v => v.id === venueId)
    setProcessing(venueId)
    try {
      await approveVenue(venueId, user.uid, userProfile.email || "")
      setVenues(venues.filter((v) => v.id !== venueId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to approve request"
      setError(errorMessage)
      console.error("Error approving request:", err)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (venueId: string) => {
    if (!user || !userProfile) return
    if (!rejectionReason[venueId]?.trim()) {
      setError("Please provide a rejection reason")
      return
    }
    const venue = venues.find(v => v.id === venueId)
    setProcessing(venueId)
    try {
      await rejectVenue(venueId, user.uid, userProfile.email || "", rejectionReason[venueId])
      setVenues(venues.filter((v) => v.id !== venueId))
      setRejectionReason((prev) => {
        const updated = { ...prev }
        delete updated[venueId]
        return updated
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reject request"
      setError(errorMessage)
      console.error("Error rejecting request:", err)
    } finally {
      setProcessing(null)
    }
  }

  const handleUpdate = async (venueId: string, updates: Partial<FirestoreVenue>) => {
    const venue = venues.find(v => v.id === venueId)
    setProcessing(venueId)
    try {
      await updateVenueAdmin(venueId, updates)
      setVenues(venues.map(v => v.id === venueId ? { ...v, ...updates } : v))
      setEditingVenue(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update venue"
      setError(errorMessage)
      console.error("Error updating venue:", err)
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (date: any) => {
    if (!date) return "N/A"
    try {
      let d: Date
      if (date instanceof Date) {
        d = date
      } else if (typeof date === 'object' && date && 'seconds' in date) {
        d = new Date((date as any).seconds * 1000)
      } else {
        const parsed = new Date(date)
        if (isNaN(parsed.getTime())) return "Invalid Date"
        d = parsed
      }
      return d.toLocaleDateString() + " " + d.toLocaleTimeString()
    } catch (e) {
      return "Invalid Date"
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f6fd] font-sans">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 relative z-10 pt-24 sm:pt-32">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#26215c] mb-2">Venue Requests</h1>
            <p className="text-[#534ab7]">Review and approve pending venue submissions</p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-white hover:bg-[#f7f6fd] text-[#26215c] border border-[#cecbf6] transition-all duration-300 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-apple-red/10 border border-apple-red/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-apple-red flex-shrink-0 mt-0.5" />
            <p className="text-apple-red font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-black animate-spin" />
          </div>
        ) : venues.length === 0 ? (
          <div className="p-12 rounded-[14px] border-2 border-dashed border-[#cecbf6] text-center bg-white">
            <p className="text-[#534ab7] text-lg">No pending requests to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-[#534ab7] mb-4">
              {venues.length} pending request{venues.length !== 1 ? "s" : ""} for review
            </div>

            {venues.map((venue) => (
              <div
                key={venue.id}
                className="p-6 rounded-[14px] bg-white border border-[#cecbf6] shadow-[0_4px_24px_rgba(107,122,144,0.04)] hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-6">
                  {venue.images.length > 0 && (
                    <div className="hidden sm:block w-24 h-24 rounded-lg overflow-hidden bg-[#f7f6fd] flex-shrink-0">
                      <img
                        src={venue.images[0]}
                        alt={venue.spaceName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#26215c] mb-1">{venue.spaceName}</h3>
                        <p className="text-sm text-[#534ab7]">
                          Submitted by {venue.submittedBy} on {formatDate(venue.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedVenueId(expandedVenueId === venue.id ? null : venue.id)
                        }
                        className="text-[#26215c] hover:text-[#534ab7] transition-colors font-bold text-sm"
                      >
                        {expandedVenueId === venue.id ? "Hide" : "Show"} details
                      </button>
                    </div>

                    {expandedVenueId === venue.id && (
                      <div className="space-y-4 mb-6 p-4 rounded-[12px] bg-[#f7f6fd] border border-[#cecbf6]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-[#534ab7] uppercase tracking-wider mb-1">
                              Location
                            </p>
                            <p className="text-[#26215c]">{venue.location}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#534ab7] uppercase tracking-wider mb-1">
                              Price & Capacity
                            </p>
                            <p className="text-[#26215c]">
                              ${venue.price}/night • Up to {venue.maxGuests} guests
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#534ab7] uppercase tracking-wider mb-1">
                              Contact
                            </p>
                            <div className="text-[#26215c] text-sm space-y-1">
                              {venue.contactPhone && (
                                <p className="flex items-center gap-2">
                                  <span className="font-semibold">Phone:</span> {venue.contactPhone}
                                </p>
                              )}
                              {venue.contactEmail && (
                                <p className="flex items-center gap-2">
                                  <span className="font-semibold">Email:</span> {venue.contactEmail}
                                </p>
                              )}
                              {!venue.contactPhone && !venue.contactEmail && <p>{venue.contact || "N/A"}</p>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#534ab7] uppercase tracking-wider mb-1">
                              Amenities
                            </p>
                            <p className="text-[#26215c]">
                              {venue.amenities.length > 0 ? venue.amenities.join(", ") : "None"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-[#534ab7] uppercase tracking-wider mb-2">
                            Description
                          </p>
                          <p className="text-[#26215c] text-sm leading-relaxed">{venue.description}</p>
                        </div>

                        {venue.images.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-[#534ab7] uppercase tracking-wider mb-2">
                              Photos ({venue.images.length})
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {venue.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`${venue.spaceName} ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => setEditingVenue(venue)}
                          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-[12px] bg-white border border-[#cecbf6] text-[#26215c] font-bold transition-all hover:bg-[#f7f6fd]"
                        >
                          Edit Details
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(venue.id!)}
                          disabled={processing === venue.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[12px] bg-[#26215c] hover:bg-black text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === venue.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            setExpandedVenueId(
                              expandedVenueId === `${venue.id}-reject` ? null : `${venue.id}-reject`
                            )
                          }
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[12px] bg-white border border-[#cecbf6] hover:bg-[#f7f6fd] text-[#26215c] font-bold transition-all duration-300"
                        >
                          <X className="w-4 h-4" />
                          Deny
                        </button>
                      </div>

                      {expandedVenueId === `${venue.id}-reject` && (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Provide a reason for denial (required)"
                            value={rejectionReason[venue.id!] || ""}
                            onChange={(e) =>
                              setRejectionReason((prev) => ({
                                ...prev,
                                [venue.id!]: e.target.value,
                              }))
                            }
                            className="w-full p-3 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] resize-none"
                            rows={3}
                          />
                          <button
                            onClick={() => handleReject(venue.id!)}
                            disabled={processing === venue.id}
                            className="w-full py-2 px-4 rounded-[12px] bg-red-500 hover:bg-red-600 text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing === venue.id ? "Denying..." : "Confirm Denial"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingVenue && (
        <VenueEditModal
          venue={editingVenue}
          onClose={() => setEditingVenue(null)}
          onSave={(updates) => handleUpdate(editingVenue.id!, updates)}
          isProcessing={processing === editingVenue.id}
        />
      )}
    </main>
  )
}
