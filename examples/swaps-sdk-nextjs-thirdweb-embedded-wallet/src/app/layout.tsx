import 'styles/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { Footer } from '../components/ui/Footer';
import { Backdrop } from 'components/ui/Backdrop';
import { Toaster } from '@/ui/toaster';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />

            <body className="relative bg-gradient-to-b to-purple-300 via-purple-200 from-purple-100 w-full min-h-[100vh] flex flex-col justify-between">
                <Backdrop />
                <main className="mb-auto">{children}</main>

                <Footer />
                <Toaster />
            </body>
        </html>
    );
}
