import 'styles/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { Footer } from '../components/ui/Footer';
import { Backdrop } from 'components/ui/Backdrop';
import { Toaster } from '@/ui/toaster';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body className="relative flex min-h-[100vh] w-full flex-col justify-between bg-gradient-to-b from-purple-100 via-purple-200 to-purple-300">
        <Backdrop />
        <main className="mb-auto">{children}</main>

        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
