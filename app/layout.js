import './globals.css';
import Providers from '@/app/providers';

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
        </Providers>
      </body>
    </html>
  );
}
