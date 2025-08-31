import { Hero } from "../components/ui/Hero";
import { ThirdwebProvider } from "../components/ThirdwebProvider";
import { Backdrop } from "components/ui/Backdrop";

export default function Home() {
  return (
    <ThirdwebProvider>
      <Backdrop />
      <Hero />
    </ThirdwebProvider>
  );
}
