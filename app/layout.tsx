import './globals.css';
import Providers from './providers';
import React from 'react';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { GoogleAnalytics } from '@next/third-parties/google';

import '@mantine/core/styles.css';

export const metadata = {
  title: 'ほしくず',
  description: '',
};

// eslint-disable-next-line require-jsdoc
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId={'G-FSTDX0TTQN'} />
    </html>
  );
}
