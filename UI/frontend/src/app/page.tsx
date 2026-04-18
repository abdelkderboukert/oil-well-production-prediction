import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import FeaturedWell from './components/FeaturedWell'
import WellsGrid from './components/WellsGrid'
import Waitlist from './components/Waitlist'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-oil-black">
      <Navbar />
      <Hero />
      <About />
      <FeaturedWell />
      <WellsGrid />
      <Waitlist />
      <Footer />
    </main>
  )
}
