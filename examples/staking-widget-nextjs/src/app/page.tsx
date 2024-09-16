import '@swing.xyz/ui/theme.css';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Sidebar from 'components/Sidebar';
import { Button } from 'components/ui/button';

import { Provider } from 'components/WagmiProvider';
import { ConnectWallet } from 'components/ConnectWallet';

import { Stake } from '@swing.xyz/ui';

export default function StakePage() {
  return (
    <Provider>
      <Sidebar />

      <main className="container relative flex min-h-screen w-full flex-col overflow-y-auto">
        <div className="flex justify-end space-x-4 p-6">
          <ConnectWallet />

          <Button className="space-x-2" variant="outline" asChild>
            <a
              href="https://github.com/swing-xyz/examples/tree/main/examples/staking-widget-nextjs"
              target="_blank"
            >
              <FontAwesomeIcon size="lg" icon={faGithub} />
              <span>Fork on Github</span>
            </a>
          </Button>
        </div>

        <div className="flex h-full items-center justify-center">
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
