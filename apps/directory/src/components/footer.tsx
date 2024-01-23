import { GithubIcon } from "./icons/github";
import { TwitterIcon } from "./icons/twitter";

const footerNavigation = [
  {
    name: "GitHub",
    href: "https://github.com/swing-xyz/examples",
    icon: GithubIcon,
  },
  {
    name: "X",
    href: "https://x.com/swing_xyz",
    icon: TwitterIcon,
  },
];

export function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-6xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {footerNavigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-muted hover:text-muted/80"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon
                className="h-5 w-5 fill-muted hover:fill-muted/80"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-muted">
            &copy; {new Date().getFullYear()} Swing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
