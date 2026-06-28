"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ExploreByCategory } from "@/components/exploreByCategory"

export default function CityPage() {
  const params = useParams()
  const city = params.city as string

  return (
    <main className="min-h-screen bg-[#f7f6fd] relative flex flex-col">
      <Header />
      
      {/* Spacer for fixed header */}
      <div style={{ height: 80 }} />

      <div className="flex-1 pt-12 md:pt-16">
        <ExploreByCategory cityHash={city} />
      </div>

      <Footer />
    </main>
  )
}
