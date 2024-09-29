import { Swap } from "@swing.xyz/ui";
import "@swing.xyz/ui/theme.css";

export default function SwapPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Swap
        title="Swap with MetaWallet"
        projectId="example-swaps-widget-nextjs"
        debug
      />
    </div>
  );
}
