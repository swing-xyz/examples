import "@swing.xyz/ui/theme.css";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "components/Sidebar";
import { Button } from "components/ui/button";

import { Provider } from "components/WagmiProvider";
import { ConnectWallet } from "components/ConnectWallet";

import { Stake } from "@swing.xyz/ui";

export default function StakePage() {
  return (
    <Provider>
      <Sidebar />

      <main className="container relative flex flex-col w-full min-h-screen overflow-y-auto">
        <div className="flex justify-end p-6 space-x-4">
          <ConnectWallet />

          <Button className="space-x-2" variant="outline" asChild>
            <a href="https://github.com/swing-xyz/examples">
              <FontAwesomeIcon size="lg" icon={faGithub} />
              <span>Fork on Github</span>
            </a>
          </Button>
        </div>

        <div className="flex items-center justify-center h-full">
          <Stake
            title="Stake with MetaWallet"
            projectId="example-staking-widget-nextjs"
            debug
          />
        </div>
      </main>
    </Provider>
  );
}
