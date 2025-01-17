import { GithubIcon } from "./icons/github";
import { SwingLogo } from "./icons/swing";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 mx-auto flex h-20 max-w-6xl items-center justify-between p-4">
      <a href="https://swing.xyz" target="_blank">
        <SwingLogo className="h-7" />
      </a>

      <nav className="flex items-center gap-5">
        <a
          className="hidden text-sm font-medium hover:opacity-90 sm:block"
          href="https://developers.swing.xyz"
          target="_blank"
        >
          Documentation
        </a>

        <Button className="hidden sm:inline-flex" variant="outline" asChild>
          <a href="https://github.com/swing-xyz/examples" target="__blank">
            <GithubIcon className="mr-2 h-4 w-4" /> Fork on Github
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
