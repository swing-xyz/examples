import { CallToAction } from '../components/ui/CallToAction';
import { Hero } from '../components/ui/Hero';
import { PrimaryFeatures } from '../components/ui/PrimaryFeatures';
import { Reviews } from '../components/ui/Reviews';
import { SecondaryFeatures } from '../components/ui/SecondaryFeatures';
import { ThirdwebProvider } from '../components/ThirdwebProvider';

export default function Home() {
  return (
    <ThirdwebProvider>
      <Hero />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <CallToAction />
      <Reviews />
    </ThirdwebProvider>
  );
}
