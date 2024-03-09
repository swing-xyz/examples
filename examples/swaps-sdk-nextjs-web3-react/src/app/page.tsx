import { CallToAction } from "../components/ui/CallToAction";
import { Hero } from "../components/ui/Hero";
import { PrimaryFeatures } from "../components/ui/PrimaryFeatures";
import { Reviews } from "../components/ui/Reviews";
import { SecondaryFeatures } from "../components/ui/SecondaryFeatures";


export default function Home() {
  return (
    <>
      <Hero />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <CallToAction />
      <Reviews />
    </>
  );
}
