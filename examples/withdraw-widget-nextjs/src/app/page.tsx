import { Withdraw } from '@swing.xyz/ui';
import '@swing.xyz/ui/theme.css';

export default function SwapPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Withdraw
        title="Withdraw with MetaWallet"
        projectId="example-withdraw-widget-nextjs"
        debug
      />
    </div>
  );
}
