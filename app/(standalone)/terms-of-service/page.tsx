import { CalendarIcon, ShieldCheckIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-2xl px-2 py-16 sm:px-4">
      <Card className="bg-card/90">
        <CardHeader className="pb-3">
          <div className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Document
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl font-light tracking-normal text-foreground">
            <ShieldCheckIcon className="h-5 w-5 text-[#aad7dc]" />
            Terms of Service
          </CardTitle>
          <CardDescription className="text-[#c7d0dd]">
            Please review the following terms before using Hoshikuzu Starfield.
          </CardDescription>
        </CardHeader>

        <Separator className="mx-6" />

        <CardContent className="max-w-none space-y-4 py-6 text-sm leading-6 text-[#c7d0dd]">
          <p>
            By using <strong>Hoshikuzu Starfield</strong>, you agree to use this experience for
            personal and non-commercial purposes only. All visual and interactive content is
            provided
            <em> “as-is” </em> without warranty of any kind.
          </p>

          <p>
            We reserve the right to update or modify the experience at any time without prior
            notice. Continued use after changes implies acceptance of the updated terms.
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>Last updated: March 24, 2025</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
