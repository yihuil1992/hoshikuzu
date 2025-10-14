import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl tracking-tight">Privacy Policy</CardTitle>
          <CardDescription className="text-base">
            How Hoshikuzu Starfield handles your data.
          </CardDescription>
        </CardHeader>

        <Separator className="mx-6" />

        <CardContent className="prose prose-neutral dark:prose-invert max-w-none py-6">
          <p>
            Hoshikuzu Starfield does not collect or store any personal data. All interactions remain
            on your device, and no information is transmitted to any servers.
          </p>

          <p>
            If we ever introduce account features or analytics, we will update this policy and
            notify users clearly.
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
