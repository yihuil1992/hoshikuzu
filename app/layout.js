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
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FSTDX0TTQN"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-FSTDX0TTQN');
                `,
        }} />
      </head>
      <body>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
