import { CalendarIcon, ShieldCheckIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl tracking-tight flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-primary" />
            Terms of Service
          </CardTitle>
          <CardDescription className="text-base">
            Please review the following terms before using Hoshikuzu Starfield.
          </CardDescription>
        </CardHeader>

        <Separator className="mx-6" />

        <CardContent className="prose prose-neutral dark:prose-invert max-w-none py-6">
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

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>Last updated: March 24, 2025</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
