import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../components/Button";
import Sidebar from "../components/Sidebar";

import "styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body className="relative flex max-h-screen min-h-full text-white bg-slate-900">
        <Sidebar />

        <main className="relative flex flex-col w-full min-h-screen overflow-y-auto">
          <div className="flex justify-end p-6">
            <Button
              href="https://github.com/polkaswitch/examples"
              className="space-x-2"
              variant="solid"
            >
              <FontAwesomeIcon size="lg" icon={faGithub} />
              <span>Fork on Github</span>
            </Button>
          </div>

          {children}
        </main>
      </body>
    </html>
  );
}
