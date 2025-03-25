'use client';

import { useEffect, useState } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import KBaseSeconds from '@/components/KBaseSeconds';
import { Button, Divider, Group, Stack } from '@mantine/core';

const MeteoTimerPage = () => {
  const [isKeshizumiRunning, setIsKeshizumiRunning] = useState(false);
  const [keshizumiSeconds, setKeshizumiSeconds] = useState(30);
  const [isKeshizumiThirty, setIsKeshizumiThirty] = useState(true);
  const [keshizumiSoundId, setKeshizumiSoundId] = useState(0);
  const [isBlazeRunning, setIsBlazeRunning] = useState(false);
  const [blazeSeconds, setBlazeSeconds] = useState(60);
  const [blazeSoundId, setBlazeSoundId] = useState(0);

  const blazeMaxSeconds = 60;
  const keshizumiMaxSeconds = isKeshizumiThirty ? 30 : 32;

  const keshizumiStartStopHandler = () => {
    setIsKeshizumiRunning(!isKeshizumiRunning);
  };

  const keshizumiResetHandler = () => {
    setKeshizumiSeconds(30);
    setIsKeshizumiRunning(true);
    setIsKeshizumiThirty(true);
  };

  const keshizumiMinusHandler = () => {
    if (keshizumiSeconds > 0) {
      setKeshizumiSeconds(keshizumiSeconds - 1);
    }
  };

  const keshizumiPlusHandler = () => {
    if (keshizumiSeconds < 32) {
      setKeshizumiSeconds(keshizumiSeconds + 1);
    }
  };

  const switchKeishizumiThirty = () => {
    setIsKeshizumiThirty(!isKeshizumiThirty);
  };

  const keshizumiSoundSwitchHandler = (soundId: number) => {
    setKeshizumiSoundId(soundId);
    localStorage.setItem('keshizumiSoundId', soundId.toString());
  };

  const blazeStartStopHandler = () => {
    setIsBlazeRunning(!isBlazeRunning);
  };

  const blazeResetHandler = () => {
    setBlazeSeconds(60);
    setIsBlazeRunning(true);
  };

  const blazeMinusHandler = () => {
    if (blazeSeconds > 0) {
      setBlazeSeconds(blazeSeconds - 1);
    }
  };

  const blazePlusHandler = () => {
    if (blazeSeconds < 60) {
      setBlazeSeconds(blazeSeconds + 1);
    }
  };

  const blazeSoundSwitchHandler = (soundId: number) => {
    setBlazeSoundId(soundId);
    localStorage.setItem('blazeSoundId', soundId.toString());
  };

  const resetBoth = () => {
    keshizumiResetHandler();
    blazeResetHandler();
  };

  const startBoth = () => {
    setIsKeshizumiRunning(true);
    setIsBlazeRunning(true);
  };

  const stopBoth = () => {
    setIsKeshizumiRunning(false);
    setIsBlazeRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isBlazeRunning) {
      interval = setInterval(() => {
        setBlazeSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            return 60;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBlazeRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isKeshizumiRunning) {
      interval = setInterval(() => {
        setKeshizumiSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setIsKeshizumiThirty(!isKeshizumiThirty);
            return isKeshizumiThirty ? 32 : 30;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isKeshizumiRunning, isKeshizumiThirty]);

  useEffect(() => {
    setKeshizumiSoundId(Number(localStorage.getItem('keshizumiSoundId')) || 1);
    setBlazeSoundId(Number(localStorage.getItem('blazeSoundId')) || 2);
  }, []);

  return (
    <Stack>
      <CountdownTimer
        title={'消し炭'}
        seconds={keshizumiSeconds}
        maxSeconds={keshizumiMaxSeconds}
        isRunning={isKeshizumiRunning}
        soundId={keshizumiSoundId}
        customComponent={
          <KBaseSeconds
            isThirty={isKeshizumiThirty}
            switchThirty={switchKeishizumiThirty}
          />
        }
        minusHandler={keshizumiMinusHandler}
        plusHandler={keshizumiPlusHandler}
        startStopHandler={keshizumiStartStopHandler}
        resetHandler={keshizumiResetHandler}
        switchSoundHandler={keshizumiSoundSwitchHandler}
      />
      <CountdownTimer
        title={'範囲技'}
        seconds={blazeSeconds}
        maxSeconds={blazeMaxSeconds}
        isRunning={isBlazeRunning}
        soundId={blazeSoundId}
        minusHandler={blazeMinusHandler}
        plusHandler={blazePlusHandler}
        startStopHandler={blazeStartStopHandler}
        resetHandler={blazeResetHandler}
        switchSoundHandler={blazeSoundSwitchHandler}
      />
      <Divider />
      <Group justify={'center'}>
        <Button
          size={'md'}
          color={isBlazeRunning || isKeshizumiRunning ? 'red' : 'blue.5'}
          onClick={isBlazeRunning || isKeshizumiRunning ? stopBoth : startBoth}
        >
          {isBlazeRunning || isKeshizumiRunning ? 'Stop Both' : 'Start Both'}
        </Button>
        <Button color={'blue.5'} onClick={resetBoth} size={'md'}>
          Reset Both
        </Button>
      </Group>
    </Stack>
  );
};

export default MeteoTimerPage;
