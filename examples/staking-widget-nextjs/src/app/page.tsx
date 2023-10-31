import { Stake } from "@swing.xyz/ui";
import "@swing.xyz/ui/theme.css";

export default function SwapPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Stake
        title="Stake with MetaWallet"
        projectId="example-staking-widget-nextjs"
      />
    </div>
  );
}
