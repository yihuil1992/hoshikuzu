import { MantineProvider } from '@mantine/core';
import React from 'react';

const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <MantineProvider>{children}</MantineProvider>;
};

export default Providers;
