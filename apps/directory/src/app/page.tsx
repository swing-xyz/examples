import { Hero } from 'components/hero';
import { Templates } from 'components/templates';

import { Suspense } from 'react';
import { Filters } from 'components/filters';
import { TemplateGrid } from 'components/template-grid';
import { getTemplates } from 'lib/templates';

const templates = getTemplates();

export const metadata = {
  metadataBase: new URL('https://examples.swing.xyz'),
  title: 'Swing Example Templates',
  description:
    'Find an example template to help you get started integrating with Swing.',
  openGraph: {
    type: 'website',
    title: 'Swing Example Templates',
    description:
      'Find an example template to help you get started integrating with Swing.',
    images: [
      {
        url: '/directory-landing.png',
        width: 1200,
        height: 838,
        alt: 'Swing Example Templates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@swing_xyz',
    site: '@swing_xyz',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Directory() {
  return (
    <>
      <Hero />

      <div id="templates" className="container">
        <div className="flex flex-col gap-10 py-16 sm:py-20 min-[960px]:flex-row">
          <div className="min-[960px]:w-56">
            <Suspense>
              <Filters />
            </Suspense>
          </div>

          <div className="flex-grow">
            <Suspense fallback={<TemplateGrid templates={templates} />}>
              <Templates templates={templates} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
