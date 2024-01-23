import { ThemeProvider } from "components/theme-provider";
import "styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header } from "components/header";
import { Footer } from "components/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body
        className={`bg-background font-sans relative antialiased max-h-screen min-h-full ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <ThemeProvider>
          <Header />

          <main className="max-w-6xl mx-auto">{children}</main>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
