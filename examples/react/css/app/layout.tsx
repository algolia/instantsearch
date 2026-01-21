import type { Metadata } from 'next';

import 'instantsearch.css/components/autocomplete.css';
// import 'instantsearch.css/components/prompt-suggestions.css';
import 'instantsearch.css/components/chat.css';
import '../styles/algolia.css';

import { DevTools } from './DevTools';
import { Providers } from './Providers';

export const metadata: Metadata = {
  title: 'React InstantSearch — CSS Example',
  description: 'A demo showcasing InstantSearch CSS styling capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <DevTools />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
