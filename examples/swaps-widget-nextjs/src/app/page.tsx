import { Swap } from "@swing.xyz/ui";
import "@swing.xyz/ui/theme.css";

export default function SwapPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Swap
        title="Swap with MetaWallet"
        projectId="example-swaps-widget-nextjs"
        debug
      />
    </div>
  );
}
