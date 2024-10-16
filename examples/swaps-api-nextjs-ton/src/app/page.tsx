import { Hero } from "../components/ui/Hero";
import { ThirdwebProvider } from "../components/ThirdwebProvider";
import { Backdrop } from "components/ui/Backdrop";
import { DefaultProviders } from "providers/DefaultProviders";

export default function Home() {
  return (
    <ThirdwebProvider>
      <DefaultProviders>
        <Backdrop />
        <Hero />
      </DefaultProviders>
    </ThirdwebProvider>
  );
}
