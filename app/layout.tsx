import './globals.css';
import 'react-medium-image-zoom/dist/styles.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import React from 'react';

import Providers from './providers';

export const metadata = {
  title: 'ほしくず',
  description: '',
  icons: {
    icon: [
      { url: '/resources/favicon.ico', sizes: 'any' },
      { url: '/resources/favicon.svg', type: 'image/svg+xml' },
      { url: '/resources/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/resources/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/resources/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId={'G-FSTDX0TTQN'} />
    </html>
  );
}
