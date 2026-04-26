import { CalendarIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-2xl px-2 py-16 sm:px-4">
      <Card className="bg-card/90">
        <CardHeader className="pb-3">
          <div className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Document
          </div>
          <CardTitle className="text-2xl font-light tracking-normal text-foreground">
            Privacy Policy
          </CardTitle>
          <CardDescription className="text-[#c7d0dd]">
            How Hoshikuzu Starfield handles your data.
          </CardDescription>
        </CardHeader>

        <Separator className="mx-6" />

        <CardContent className="max-w-none space-y-4 py-6 text-sm leading-6 text-[#c7d0dd]">
          <p>
            Hoshikuzu Starfield does not collect or store any personal data. All interactions remain
            on your device, and no information is transmitted to any servers.
          </p>

          <p>
            If we ever introduce account features or analytics, we will update this policy and
            notify users clearly.
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
