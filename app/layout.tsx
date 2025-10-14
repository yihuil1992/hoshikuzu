import './globals.css';
import React from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import Providers from './providers';

export const metadata = {
  title: 'ほしくず',
  description: '',
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
