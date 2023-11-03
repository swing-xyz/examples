import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "components/Sidebar";
import { Button } from "components/ui/button";

import "styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { WagmiProvider } from "components/WagmiProvider";
import { ConnectWallet } from "components/ConnectWallet";
import { SwingSdkProvider } from "components/SwingSdkProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body className="relative flex max-h-screen min-h-full text-white bg-slate-900">
        <SwingSdkProvider>
          <WagmiProvider>
            <Sidebar />

            <main className="container relative flex flex-col w-full min-h-screen overflow-y-auto">
              <div className="flex justify-end p-6 space-x-4">
                <ConnectWallet />

                <Button className="space-x-2" variant="outline" asChild>
                  <a href="https://github.com/polkaswitch/examples">
                    <FontAwesomeIcon size="lg" icon={faGithub} />
                    <span>Fork on Github</span>
                  </a>
                </Button>
              </div>

              {children}
            </main>
          </WagmiProvider>
        </SwingSdkProvider>
      </body>
    </html>
  );
}
