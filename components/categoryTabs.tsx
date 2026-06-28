"use client"

import { Home, Tent, Umbrella, Droplets, Image as ImageIcon, Sparkles, Star, SlidersHorizontal } from "lucide-react"

const CATEGORIES = [
  { label: "All stays", icon: Home },
  { label: "Villas", icon: Home },
  { label: "Cabins", icon: Tent },
  { label: "Beachfront", icon: Umbrella },
  { label: "Pool", icon: Droplets },
  { label: "Amazing views", icon: ImageIcon },
  { label: "New", icon: Sparkles },
  { label: "Top rated", icon: Star },
]

export function CategoryTabs({ activeCategory, onCategoryChange }: { activeCategory?: string, onCategoryChange?: (category: string) => void }) {
  return (
    <div className="w-full border-b border-[#cecbf6] bg-transparent sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-10 overflow-x-auto scrollbar-hide py-4">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory ? activeCategory === category.label : category.label === "All stays"
            
            return (
              <button
                key={category.label}
                onClick={() => onCategoryChange && onCategoryChange(category.label)}
                className={`flex flex-col items-center justify-center gap-2 flex-shrink-0 min-w-[80px] border-b-2 pb-1 transition-colors ${
                  isActive 
                    ? "border-[#26215c] text-[#26215c]" 
                    : "border-transparent text-[#534ab7] hover:text-[#26215c]"
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span className="text-[13px] font-medium">{category.label}</span>
              </button>
            )
          })}
        </div>
        
        <button className="flex items-center gap-2 px-5 py-2.5 border border-[#cecbf6] rounded-lg ml-6 font-medium text-[14px] text-[#26215c] bg-white hover:bg-[#f7f6fd] shadow-sm transition-colors flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>
    </div>
  )
}
