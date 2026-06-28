import { Header } from "@/components/header"
import { HeroSection } from "@/components/heroSection"
import { ExploreByCategory } from "@/components/exploreByCategory"
import { FeaturedVenuesGrid } from "@/components/featuredVenuesGrid"
import { PopularLocations } from "@/components/popularLocations"
import { ListYourSpace } from "@/components/listYourSpace"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f6fd] relative homepage-wrapper overflow-x-hidden">
      <Header />
      <HeroSection />
      <ExploreByCategory />
      <FeaturedVenuesGrid />
      <PopularLocations />
      <div className="w-full pt-8 md:pt-10 pb-0">
        <ListYourSpace variant="dark" />
      </div>
      <Footer />
    </main>
  )
}
