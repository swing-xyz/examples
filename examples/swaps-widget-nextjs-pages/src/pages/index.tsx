import { Swap } from "@swing.xyz/ui";
import "@swing.xyz/ui/theme.css";

export default function SwapPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <div className="flex-1">
        <Swap title="Swap" projectId="example-swaps-widget-nextjs-pages" />
      </div>
    </main>
  );
}
