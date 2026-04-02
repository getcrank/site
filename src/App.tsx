import { Navbar } from "./components/ui/Navbar";
import { Hero } from "./components/landing/Hero";
import { Divider } from "./components/ui/Divider";
import { FeatureCards } from "./components/landing/FeatureCards";
import { InfoCards } from "./components/landing/InfoCards";
import { TeaserCard } from "./components/landing/TeaserCard";
import { CodeExample } from "./components/landing/CodeExample";
import { Footer } from "./components/ui/Footer";

function App() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto">
      <Navbar />
      <Hero />
      <CodeExample />
      <Divider label="How it works" />
      <FeatureCards />
      <InfoCards />
      <TeaserCard />
      <Footer />
    </div>
  );
}

export default App;
