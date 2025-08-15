import "styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";

import { Toaster } from "components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body>
        <Header />

        <main>{children}</main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
