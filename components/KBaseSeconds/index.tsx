import { Group, Switch, Text } from '@mantine/core';
import s from './kBaseSeconds.module.css';

const KBaseSeconds = ({
  isThirty,
  switchThirty,
}: {
  isThirty: boolean;
  switchThirty: () => void;
}) => {
  return (
    <Group>
      <Text>今は</Text>
      <Text className={isThirty ? s.active_text : s.idle_text}>30秒</Text>
      <Switch
        checked={!isThirty}
        onClick={switchThirty}
        styles={{ track: { backgroundColor: '#339af0' } }}
      />
      <Text className={isThirty ? s.idle_text : s.active_text}>32秒</Text>
      <Text>から</Text>
    </Group>
  );
};

export default KBaseSeconds;
