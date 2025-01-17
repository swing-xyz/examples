import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Badge } from "./ui/badge";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { cn } from "lib/utils";

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  url: string;
  keywords: string[];
  integration?: string;
  framework?: string;
  wallet?: string;
  "use-case"?: string;
};

export function TemplateGrid({ templates }: { templates: TemplateMeta[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 min-[960px]:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const FrameworkIcon = template.framework
          ? FrameworkIcons[template.framework as keyof typeof FrameworkIcons]
          : null;

        return (
          <Card
            key={template.id}
            className="bg-background relative mx-auto flex flex-col overflow-hidden duration-300 hover:scale-105 sm:max-w-72"
          >
            <a
              className="absolute inset-0"
              href={template.url}
              target="__blank"
            />

            <div
              className={cn(
                "flex h-44 items-center justify-center bg-gradient-to-r",
                {
                  "to-slate-800": template.framework === "Next.js",
                  "to-sky-500": template.framework === "Webpack",
                  "to-red-500": template.framework === "Angular",

                  "from-blue-400": template["use-case"] === "Swaps",
                  "from-amber-300": template["use-case"] === "Staking",
                  "from-emerald-500": template["use-case"] === "Withdraw",
                  "from-rose-500": template["use-case"] === "Gas",

                  "via-indigo-500": template.integration === "Widget",
                  "via-emerald-500": template.integration === "SDK",
                  "via-amber-500": template.integration === "API",
                },
              )}
            >
              {FrameworkIcon ? (
                <FrameworkIcon className="h-20 w-20 fill-white" />
              ) : null}
            </div>

            <CardHeader className="flex-grow">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>

            <CardFooter className="flex-wrap gap-x-2 gap-y-2">
              {template.framework ? (
                <Badge variant="secondary">{template.framework}</Badge>
              ) : null}

              {template.wallet ? (
                <Badge variant="secondary">{template.wallet}</Badge>
              ) : null}

              <div className="flex-grow" />

              <ExternalLinkIcon />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

const FrameworkIcons = {
  "Next.js": (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Next.js</title>
      <path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474s.012 1.0884.108 1.7476c.652 4.506 3.8591 8.2919 8.2087 9.6945.7789.2511 1.6.4223 2.5337.5255.3636.04 1.9354.04 2.299 0 1.6117-.1783 2.9772-.577 4.3237-1.2643.2065-.1056.2464-.1337.2183-.1573-.0188-.0139-.8987-1.1938-1.9543-2.62l-1.919-2.592-2.4047-3.5583c-1.3231-1.9564-2.4117-3.556-2.4211-3.556-.0094-.0026-.0187 1.5787-.0235 3.509-.0067 3.3802-.0093 3.5162-.0516 3.596-.061.115-.108.1618-.2064.2134-.075.0374-.1408.0445-.495.0445h-.406l-.1078-.068a.4383.4383 0 01-.1572-.1712l-.0493-.1056.0053-4.703.0067-4.7054.0726-.0915c.0376-.0493.1174-.1125.1736-.143.0962-.047.1338-.0517.5396-.0517.4787 0 .5584.0187.6827.1547.0353.0377 1.3373 1.9987 2.895 4.3608a10760.433 10760.433 0 004.7344 7.1706l1.9002 2.8782.096-.0633c.8518-.5536 1.7525-1.3418 2.4657-2.1627 1.5179-1.7429 2.4963-3.868 2.8247-6.134.0961-.6591.1078-.854.1078-1.7475 0-.8937-.012-1.0884-.1078-1.7476-.6522-4.506-3.8592-8.2919-8.2087-9.6945-.7672-.2487-1.5836-.42-2.4985-.5232-.169-.0176-1.0835-.0366-1.6123-.037zm4.0685 7.217c.3473 0 .4082.0053.4857.047.1127.0562.204.1642.237.2767.0186.061.0234 1.3653.0186 4.3044l-.0067 4.2175-.7436-1.14-.7461-1.14v-3.066c0-1.982.0093-3.0963.0234-3.1502.0375-.1313.1196-.2346.2323-.2955.0961-.0494.1313-.054.4997-.054z" />
    </svg>
  ),
  Webpack: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Webpack</title>
      <path d="M22.1987 18.498l-9.7699 5.5022v-4.2855l6.0872-3.3338 3.6826 2.117zm.6683-.6026V6.3884l-3.5752 2.0544v7.396zm-21.0657.6026l9.7699 5.5022v-4.2855L5.484 16.3809l-3.6826 2.117zm-.6683-.6026V6.3884l3.5751 2.0544v7.396zm.4183-12.2515l10.0199-5.644v4.1434L5.152 7.6586l-.0489.028zm20.8975 0l-10.02-5.644v4.1434l6.4192 3.5154.0489.028 3.5518-2.0427zm-10.8775 13.096l-6.0056-3.2873V8.9384l6.0054 3.4525v6.349zm.8575 0l6.0053-3.2873V8.9384l-6.0053 3.4525zM5.9724 8.1845l6.0287-3.3015L18.03 8.1845l-6.0288 3.4665z" />
    </svg>
  ),
  Angular: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Angular</title>
      <path d="M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z" />
    </svg>
  ),
};
