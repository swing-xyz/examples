import "styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";

import { Toaster } from "components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <Header />

        <main className="min-h-screen">{children}</main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
