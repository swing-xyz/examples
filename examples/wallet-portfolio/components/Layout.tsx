import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "./Button";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex max-h-screen min-h-full text-white bg-slate-900">
      <Sidebar />

      <div className="relative flex flex-col w-full min-h-screen overflow-y-auto">
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
      </div>
    </div>
  );
}
