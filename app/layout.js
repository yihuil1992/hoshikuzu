import './globals.css';
import Providers from '@/app/providers';
import {Analytics} from '@vercel/analytics/react';

export const metadata = {
  title: 'ほしくず',
  description: '',
};

// eslint-disable-next-line require-jsdoc
export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
