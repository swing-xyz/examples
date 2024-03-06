import "styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body>
        <Header />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}
