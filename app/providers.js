'use client';
import {CacheProvider} from '@chakra-ui/next-js';
import {ChakraProvider, extendTheme} from '@chakra-ui/react';
import {switchTheme} from '@/theme/components/Switch';

const theme = extendTheme({
  components: {
    Switch: switchTheme,
  },
});
const Providers = ({children}) => {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
};

export default Providers;
