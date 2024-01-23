import { GithubIcon } from "./icons/github";
import { SwingLogo } from "./icons/swing";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="absolute top-0 inset-x-0 flex justify-between items-center h-20 p-4 max-w-6xl mx-auto z-10">
      <a href="https://swing.xyz" target="_blank">
        <SwingLogo className="h-7" />
      </a>

      <nav className="flex items-center gap-5">
        <a
          className="text-sm font-medium hover:opacity-90 hidden sm:block"
          href="https://developers.swing.xyz"
          target="_blank"
        >
          Documentation
        </a>

        <Button className="hidden sm:inline-flex" variant="outline" asChild>
          <a href="https://github.com/swing-xyz/examples" target="__blank">
            <GithubIcon className="w-4 h-4 mr-2" /> Fork on Github
          </a>
        </Button>

        <Button variant="default" asChild>
          <a href="https://platform.swing.xyz" target="__blank">
            Start Building
          </a>
        </Button>
      </nav>
    </header>
  );
}
