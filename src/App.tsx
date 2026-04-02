import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Divider } from "./components/Divider";
import { FeatureCards } from "./components/FeatureCards";
import { InfoCards } from "./components/InfoCards";
import { TeaserCard } from "./components/TeaserCard";
import { CodeExample } from "./components/CodeExample";
import { Footer } from "./components/Footer";

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
