import "styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body className="relative flex max-h-screen min-h-full text-white bg-slate-900">
        {children}
      </body>
    </html>
  );
}
