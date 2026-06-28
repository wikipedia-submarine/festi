"use client"

import { useState, useRef, Fragment } from "react"
import { X, ChevronLeft, ChevronRight, UploadCloud } from "lucide-react"
import { format, startOfMonth, endOfMonth, addMonths, eachDayOfInterval, getDay, isBefore } from "date-fns"

const AMENITIES = [
  { id: "parking", label: "Parking" },
  { id: "wifi", label: "WiFi" },
  { id: "kitchen", label: "Kitchen" },
  { id: "pool", label: "Pool" },
  { id: "rooftop", label: "Rooftop" },
  { id: "garden", label: "Garden" },
  { id: "sound", label: "Sound System" },
  { id: "lighting", label: "Lighting Equipment" },
  { id: "security", label: "Security" },
  { id: "ac", label: "Air Conditioning" },
]

const CATEGORIES = [
  { id: "Spaces", label: "Spaces" },
  { id: "Houses", label: "Houses" },
  { id: "Birthday Centers", label: "Birthday Centers" },
]

const CITIES = [
  { id: "tbilisi", label: "Tbilisi" },
  { id: "batumi", label: "Batumi" },
  { id: "kutaisi", label: "Kutaisi" },
  { id: "borjomi", label: "Borjomi" },
]

export interface VenueFormValues {
  spaceName: string
  location: string
  district: string
  mapsLink: string
  description: string
  price: string
  dailyPrice: string
  minDuration: string
  maxGuests: string
  amenities: string[]
  contactPhone: string
  contactEmail: string
  category: string
  city: string
  images: string[]
  videos: string[]
  availableDates: string[]
}

export const INITIAL_FORM: VenueFormValues = {
  spaceName: "",
  location: "",
  district: "",
  mapsLink: "",
  description: "",
  price: "",
  dailyPrice: "",
  minDuration: "1",
  maxGuests: "",
  amenities: [],
  contactPhone: "",
  contactEmail: "",
  category: "Spaces",
  city: "tbilisi",
  images: [],
  videos: [],
  availableDates: [],
}

// INPUT
export function InputField({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label className="text-[13px] font-medium text-[#26215c]">{label}</label>
        {required && <span className="text-red-500 text-[12px]">*</span>}
      </div>
      <input
        {...props}
        className="w-full px-4 py-3.5 rounded-lg bg-[#FFFFFF] border border-[#cecbf6] transition-all duration-200 text-[15px] text-[#26215c] placeholder:text-[#534ab7] outline-none focus:border-[#26215c] focus:ring-1 focus:ring-[#26215c]"
      />
    </div>
  )
}

// TEXTAREA
export function TextareaField({ label, required, ...props }: { label: string; required?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label className="text-[13px] font-medium text-[#26215c]">{label}</label>
        {required && <span className="text-red-500 text-[12px]">*</span>}
      </div>
      <textarea
        {...props}
        className="w-full px-4 py-3.5 rounded-lg bg-[#FFFFFF] border border-[#cecbf6] transition-all duration-200 text-[15px] text-[#26215c] placeholder:text-[#534ab7] outline-none focus:border-[#26215c] focus:ring-1 focus:ring-[#26215c] resize-none"
      />
    </div>
  )
}

// PILLS
export function PillSelect({ items, selected, onSelect, multi = false }: {
  items: { id: string; label: string }[]
  selected: string | string[]
  onSelect: (id: string) => void
  multi?: boolean
}) {
  const isSelected = (id: string) => multi ? (selected as string[]).includes(id) : selected === id
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`px-5 py-2.5 rounded-md text-[14px] font-medium transition-all duration-200 border cursor-pointer
            ${isSelected(item.id)
              ? "bg-[#26215c] text-[#FFFFFF] border-[#26215c]"
              : "bg-[#FFFFFF] text-[#26215c] border-[#cecbf6] hover:border-[#26215c] hover:bg-[#f7f6fd]"
            }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

// PHOTO UPLOAD
export function PhotoUpload({ images, onAdd, onRemove }: {
  images: string[]
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (i: number) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-4">
      <div
        onClick={() => ref.current?.click()}
        className="w-full aspect-[21/9] rounded-lg border border-dashed border-[#cecbf6] flex flex-col items-center justify-center cursor-pointer hover:bg-[#f7f6fd] hover:border-[#26215c]/30 transition-all duration-200 bg-[#FFFFFF]"
      >
        <div className="w-12 h-12 rounded-sm bg-[#f7f6fd] flex items-center justify-center mb-3">
          <UploadCloud className="w-5 h-5 text-[#26215c]" />
        </div>
        <span className="text-[15px] font-medium text-[#26215c]">Drag & drop or click to upload</span>
        <span className="text-[13px] text-[#534ab7] mt-1">High-quality JPG, PNG up to 10MB</span>
        <input ref={ref} type="file" multiple accept="image/*" onChange={onAdd} className="hidden" />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden group border border-[#cecbf6]">
              <img src={img} className="w-full h-full object-cover" alt="" />
              <button onClick={() => onRemove(i)} className="absolute top-2 right-2 p-1.5 bg-[#26215c]/80 backdrop-blur-sm text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// CALENDAR
export function AvailabilityCalendar({ selectedDates, onChange }: { selectedDates: string[]; onChange: (dates: string[]) => void }) {
  const todayDate = new Date()
  const [currentIdx, setCurrentIdx] = useState(0)
  const months = [todayDate, addMonths(todayDate, 1), addMonths(todayDate, 2), addMonths(todayDate, 3), addMonths(todayDate, 4)]

  const toggleDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    onChange(selectedDates.includes(dateStr) ? selectedDates.filter(d => d !== dateStr) : [...selectedDates, dateStr])
  }

  const renderMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const monthDays = eachDayOfInterval({ start, end })
    const paddingCount = (getDay(start) + 6) % 7
    const allSlots = [...Array(paddingCount).fill(null), ...monthDays]
    const weeks: (Date | null)[][] = []
    for (let i = 0; i < allSlots.length; i += 7) weeks.push(allSlots.slice(i, i + 7))
    while (weeks.length < 6) weeks.push(Array(7).fill(null))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[16px] font-semibold text-[#26215c]">{format(monthDate, "MMMM yyyy")}</h4>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0} className="w-9 h-9 rounded-md flex items-center justify-center bg-[#f7f6fd] hover:bg-[#cecbf6] disabled:opacity-30 transition-all cursor-pointer border border-transparent hover:border-[#cecbf6]"><ChevronLeft className="w-4 h-4 text-[#26215c]" /></button>
            <button type="button" onClick={() => setCurrentIdx(Math.min(months.length - 1, currentIdx + 1))} disabled={currentIdx === months.length - 1} className="w-9 h-9 rounded-md flex items-center justify-center bg-[#f7f6fd] hover:bg-[#cecbf6] disabled:opacity-30 transition-all cursor-pointer border border-transparent hover:border-[#cecbf6]"><ChevronRight className="w-4 h-4 text-[#26215c]" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d, i) => (
            <div key={i} className="text-center text-[12px] font-medium text-[#534ab7] py-2">{d}</div>
          ))}

          {weeks.map((week, w) => (
            <Fragment key={w}>
              {week.map((date, d) => {
                if (!date) return <div key={`e-${w}-${d}`} className="aspect-square" />
                const dateStr = date.toISOString().split('T')[0]
                const isSelected = selectedDates.includes(dateStr)
                const isPast = isBefore(date, todayDate)

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isPast}
                    onClick={() => toggleDate(date)}
                    className={`aspect-square rounded-md flex items-center justify-center text-[14px] font-medium transition-all cursor-pointer ${isPast ? "opacity-20 cursor-not-allowed text-[#26215c]"
                      : isSelected ? "bg-[#26215c] text-[#FFFFFF]"
                        : "bg-[#f7f6fd] hover:bg-[#cecbf6] text-[#26215c]"
                      }`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    )
  }

  return <div className="p-6 rounded-lg bg-[#FFFFFF] border border-[#cecbf6]">{renderMonth(months[currentIdx])}</div>
}

export { AMENITIES, CATEGORIES, CITIES }