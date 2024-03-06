import { CallToAction } from "../components/ui/CallToAction";
import { Hero } from "../components/ui/Hero";
import { PrimaryFeatures } from "../components/ui/PrimaryFeatures";
import { Reviews } from "../components/ui/Reviews";
import { SecondaryFeatures } from "../components/ui/SecondaryFeatures";


import { Web3ReactHooks, Web3ReactProvider, initializeConnector  } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

export const [metaMask, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))

const connectors: [MetaMask , Web3ReactHooks][] = [
  [metaMask, hooks],
]

export default function Home() {
  return (
    <Web3ReactProvider connectors={connectors}>
      <Hero />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <CallToAction />
      <Reviews />
    </Web3ReactProvider>
  );
}
