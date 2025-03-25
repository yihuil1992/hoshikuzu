import { Space, Text, Title } from '@mantine/core';

export default function PrivacyPolicy() {
  return (
    <div>
      <Title order={2}>Privacy Policy</Title>
      <Space h="md" />
      <Text>
        Hoshikuzu Starfield does not collect or store any personal data. All
        interactions remain on your device, and no information is transmitted to
        any servers.
      </Text>
      <Space h="md" />
      <Text>
        If we ever introduce account features or analytics, we will update this
        policy and notify users clearly.
      </Text>
      <Space h="md" />
      <Text size="sm" c="dimmed">
        Last updated: March 24, 2025
      </Text>
    </div>
  );
}
