import { counterEffects } from '@/constants/soundEffects';
import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Button,
  Center,
  Flex,
  Group,
  RingProgress,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconMinus,
  IconPlus,
  IconVolume,
  IconVolumeOff,
} from '@tabler/icons-react';
const CountdownTimer = ({
  title,
  seconds,
  maxSeconds = 60,
  isRunning,
  customComponent,
  soundId,
  minusHandler,
  plusHandler,
  startStopHandler,
  resetHandler,
  switchSoundHandler,
}: {
  title: string;
  seconds: number;
  maxSeconds?: number;
  isRunning: boolean;
  customComponent?: React.ReactNode;
  soundId: number;
  minusHandler: () => void;
  plusHandler: () => void;
  startStopHandler: () => void;
  resetHandler: () => void;
  switchSoundHandler: (id: number) => void;
}) => {
  const currentSoundSetting =
    counterEffects.find((effect) => {
      return effect.id === soundId;
    }) || counterEffects[0];
  const [beepAudio, setBeepAudio] = useState<HTMLAudioElement | null>(null);
  const [beepFinishAudio, setBeepFinishAudio] =
    useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentSoundSetting.playSound) {
      setBeepAudio(new Audio(currentSoundSetting.counterSoundPath));
      setBeepFinishAudio(new Audio(currentSoundSetting.finishSoundPath));
    }
  }, [currentSoundSetting]);

  useEffect(() => {
    if (beepAudio && currentSoundSetting.playSound && seconds < 5) {
      beepAudio.volume = currentSoundSetting.volume || 0.5;
      beepAudio.load();
      beepAudio.play();
    }

    if (beepFinishAudio && currentSoundSetting.playSound && seconds === 0) {
      beepFinishAudio.volume = currentSoundSetting.volume || 0.5;
      beepFinishAudio.load();
      beepFinishAudio.play();
    }
  }, [seconds]);

  const soundEffectsData = counterEffects.map((effect) => ({
    value: effect.id.toString(),
    label: (
      <Center>
        {effect.playSound ? (
          <IconVolume size={16} />
        ) : (
          <IconVolumeOff size={16} />
        )}
        <Text inline={true}>
          {effect.id === -1 ? 'Mute' : effect.id.toString()}
        </Text>
      </Center>
    ),
  }));

  return (
    <Stack align={'center'} justify={'center'} pos={'relative'}>
      <Title>{title}</Title>

      <SegmentedControl
        data={soundEffectsData}
        value={currentSoundSetting.id.toString()}
        onChange={(value) => {
          switchSoundHandler(Number(value));
        }}
      />
      {customComponent}
      <Group>
        <ActionIcon
          variant={'outline'}
          aria-label={'Minus'}
          onClick={minusHandler}
        >
          <IconMinus />
        </ActionIcon>
        <RingProgress
          label={
            <Center>
              <Text fz={22} fw={600}>
                {seconds}
              </Text>
            </Center>
          }
          sections={[{ value: (seconds / maxSeconds) * 100, color: 'blue.5' }]}
          transitionDuration={250}
          size={100}
          thickness={8}
        />
        <ActionIcon
          variant={'outline'}
          aria-label={'Plus'}
          onClick={plusHandler}
        >
          <IconPlus />
        </ActionIcon>
      </Group>
      <Flex align="center" justify="center">
        <Button
          onClick={startStopHandler}
          color={isRunning ? 'red' : 'blue.5'}
          size="md"
          me={2}
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button onClick={resetHandler} size="md" variant="outline">
          Reset
        </Button>
      </Flex>
    </Stack>
  );
};

export default CountdownTimer;
