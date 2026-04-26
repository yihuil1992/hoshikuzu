import { StandaloneThemeProvider } from '@/components/standalone-theme';
import StarField from '@/components/starfield/starfield';

export default function Home() {
  return (
    <StandaloneThemeProvider>
      <StarField />
    </StandaloneThemeProvider>
  );
}
