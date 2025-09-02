import "styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { Header } from "../components/ui/Header";
import dynamic from "next/dynamic";

import { Toaster } from "components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  const SuiWalletProviders = dynamic(
    () => import("components/providers/SuiWalletProviders"),
    { ssr: false },
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body className="min-h-screen">
        <SuiWalletProviders>
          <Header />
          <main>{children}</main>
          <Toaster />
        </SuiWalletProviders>
      </body>
    </html>
  );
}
