import "styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { Header } from "../components/ui/Header";

import { Toaster } from "components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body className="min-h-screen overflow-hidden">
        <div className="absolute left-1/2 top-[60%] h-[150%] w-[150%] -translate-x-1/2 rounded-[100%] bg-sky-500 ring-1 ring-sky-600"></div>
        <div className="absolute bottom-[70%] left-1/2 h-[150%] w-[150%] -translate-x-1/2 rounded-[100%] bg-sky-500 ring-1 ring-sky-600"></div>
        <Header />

        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
