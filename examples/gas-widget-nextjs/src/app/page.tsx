import { Gas } from "@swing.xyz/ui";
import "@swing.xyz/ui/theme.css";

export default function SwapPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Gas
        title="Gas Refill with MetaWallet"
        projectId="example-gas-widget-nextjs"
        debug
      />
    </div>
  );
}
