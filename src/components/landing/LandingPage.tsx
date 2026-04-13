import { Navbar } from "../ui/Navbar";
import { Hero } from "./Hero";
import { Divider } from "../ui/Divider";
import { FeatureCards } from "./FeatureCards";
import { InfoCards } from "./InfoCards";
import { TeaserCard } from "./TeaserCard";
import { BrokerCard } from "./BrokerCard";
import { CodeExample } from "./CodeExample";
import { Footer } from "../ui/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto">
      <Navbar />
      <Hero />
      <CodeExample />
      <Divider label="How it works" />
      <FeatureCards />
      <InfoCards />
      <TeaserCard />
      <BrokerCard />
      <Footer />
    </div>
  );
}
