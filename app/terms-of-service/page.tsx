import { Space, Text, Title } from '@mantine/core';

export default function TermsOfService() {
  return (
    <div>
      <Title order={2}>Terms of Service</Title>
      <Space h="md" />
      <Text>
        By using Hoshikuzu Starfield, you agree to use this experience for
        personal and non-commercial purposes only. All visual and interactive
        content is provided &#34;as-is&#34; without warranty.
      </Text>
      <Space h="md" />
      <Text>
        We reserve the right to update or modify the experience without prior
        notice. Continued use after changes implies acceptance of the updated
        terms.
      </Text>
      <Space h="md" />
      <Text size="sm" c="dimmed">
        Last updated: March 24, 2025
      </Text>
    </div>
  );
}
