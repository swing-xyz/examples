import Head from "next/head";

import { CallToAction } from "../components/CallToAction";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { PrimaryFeatures } from "../components/PrimaryFeatures";
import { Reviews } from "../components/Reviews";
import { SecondaryFeatures } from "../components/SecondaryFeatures";

export default function Home() {
  return (
    <>
      <Head>
        <title>Altcoin - Buy at the top, sell at the bottom.</title>
        <meta
          name="description"
          content="By leveraging insights from our network of industry insiders, you’ll know exactly when to buy to maximize profit, and exactly when to sell to avoid painful losses."
        />
      </Head>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <SecondaryFeatures />
        <CallToAction />
        <Reviews />
      </main>
      <Footer />
    </>
  );
}
