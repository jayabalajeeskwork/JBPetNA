import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PetRegistrationSection from "@/components/PetRegistrationSection";
import PetParentsSection from "@/components/PetParentsSection";
import ComplianceSection from "@/components/ComplianceSection";
import Footer from "@/components/Footer";
import SearchPets from "@/components/search-pets";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <PetRegistrationSection />
      <PetParentsSection />
      <ComplianceSection />
      <SearchPets />
      <Footer />
    </main>
  );
}
