"use client"

import { Search, ChevronDown } from "lucide-react"

export function SearchFilterBar() {
  return (
    <div className="max-w-[850px] mx-auto bg-white rounded-lg border border-[#cecbf6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center h-16 divide-x divide-[#cecbf6]">
      <div className="flex-1 flex items-center px-4 gap-3">
        <Search className="w-5 h-5 text-[#afa9ec]" />
        <input 
          type="text" 
          placeholder="Where are you going?" 
          className="w-full bg-transparent border-none outline-none text-[15px] text-[#26215c] placeholder:text-[#afa9ec]"
        />
      </div>
      <div className="w-[160px] px-4 flex flex-col justify-center">
        <span className="text-[12px] font-semibold text-[#26215c]">Check in</span>
        <span className="text-[14px] text-[#534ab7]">Add date</span>
      </div>
      <div className="w-[160px] px-4 flex flex-col justify-center">
        <span className="text-[12px] font-semibold text-[#26215c]">Check out</span>
        <span className="text-[14px] text-[#534ab7]">Add date</span>
      </div>
      <div className="w-[180px] px-4 flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <span className="text-[12px] font-semibold text-[#26215c]">Guests</span>
          <span className="text-[14px] text-[#534ab7]">Add guests</span>
        </div>
        <ChevronDown className="w-4 h-4 text-[#afa9ec]" />
      </div>
      <div className="px-2">
        <button className="bg-[#26215c] text-white px-6 py-2.5 rounded-md font-semibold text-[15px] hover:bg-black transition-colors">
          Search
        </button>
      </div>
    </div>
  )
}
