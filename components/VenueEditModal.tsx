"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { FirestoreVenue } from "@/lib/firestore-venues"

interface VenueEditModalProps {
  venue: FirestoreVenue
  onClose: () => void
  onSave: (updates: Partial<FirestoreVenue>) => void
  isProcessing: boolean
}

export function VenueEditModal({
  venue,
  onClose,
  onSave,
  isProcessing
}: VenueEditModalProps) {
  const [formData, setFormData] = useState({
    spaceName: venue.spaceName,
    description: venue.description,
    price: venue.price.toString(),
    maxGuests: venue.maxGuests.toString(),
    location: venue.location,
    contactPhone: venue.contactPhone || "",
    contactEmail: venue.contactEmail || "",
  })

  const handleSave = () => {
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      maxGuests: parseInt(formData.maxGuests)
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[14px] shadow-2xl p-8 border border-[#cecbf6] overflow-y-auto max-h-[90vh] animate-scale-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-[#26215c]">Edit Venue Details</h2>
            <p className="text-sm text-[#534ab7]">Modify the submission before approval or update live listing</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-[#f7f6fd] rounded-[12px] transition-all duration-300 hover:rotate-90 text-[#26215c]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#26215c] mb-2">Venue Name</label>
              <input 
                className="w-full px-5 py-3.5 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] focus:border-[#26215c] transition-all duration-300" 
                value={formData.spaceName} 
                onChange={e => setFormData({...formData, spaceName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#26215c] mb-2">Description</label>
              <textarea 
                className="w-full px-5 py-3.5 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] focus:border-[#26215c] transition-all duration-300 h-40 resize-none" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#26215c] mb-2">Price (₾)</label>
                <input 
                  type="number"
                  className="w-full px-5 py-3.5 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] focus:border-[#26215c] transition-all duration-300" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#26215c] mb-2">Max Guests</label>
                <input 
                  type="number"
                  className="w-full px-5 py-3.5 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] focus:border-[#26215c] transition-all duration-300" 
                  value={formData.maxGuests} 
                  onChange={e => setFormData({...formData, maxGuests: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#26215c] mb-2">Location Label</label>
              <input 
                className="w-full px-5 py-3.5 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] focus:border-[#26215c] transition-all duration-300" 
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#26215c] mb-2">Contact Phone</label>
                <input 
                  className="w-full px-5 py-3.5 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] focus:border-[#26215c] transition-all duration-300" 
                  value={formData.contactPhone} 
                  onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#26215c] mb-2">Contact Email</label>
                <input 
                  className="w-full px-5 py-3.5 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] placeholder-[#534ab7] focus:outline-none focus:ring-1 focus:ring-[#26215c] focus:border-[#26215c] transition-all duration-300" 
                  value={formData.contactEmail} 
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button 
            onClick={handleSave}
            disabled={isProcessing}
            className="flex-1 py-4 px-6 rounded-[12px] bg-[#26215c] text-white font-bold text-lg hover:shadow-lg hover:bg-black hover:scale-[1.02] active:scale-98 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : "Save Changes"}
          </button>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-4 px-6 rounded-[12px] border border-[#cecbf6] bg-white text-[#26215c] font-bold text-lg hover:border-[#26215c] hover:bg-[#f7f6fd] transition-all duration-300 active:scale-98 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
