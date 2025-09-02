import { Hero } from "../components/ui/Hero";
import { ThirdwebProvider } from "../components/ThirdwebProvider";

export default function Home() {
  return (
    <ThirdwebProvider>
      <Hero />
    </ThirdwebProvider>
  );
}
