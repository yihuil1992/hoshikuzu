import {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  HStack,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import {FaMinus, FaPlus} from 'react-icons/fa';
import {counterEffects} from '@/constants/soundEffects';
import SoundSelector from '@/components/SoundSelector';

const OneMinTimer = ({isGlobalRunning, setIsGlobalRunning}) => {
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [sounds, setSounds] = useState(counterEffects[0]);

  const [beepAudio, setBeepAudio] = useState(null);
  const [beepFinishAudio, setBeepFinishAudio] = useState(null);

  const changeSounds = (newSounds) => {
    const newSoundIdx = counterEffects.findIndex((effect) => {
      return effect.counterSoundPath === newSounds.counterSoundPath;
    }) || 0;
    localStorage.setItem('blazeSoundIdx', newSoundIdx);
    setSounds(newSounds);
  };

  const changePlaySound = (newPlaySound) => {
    localStorage.setItem('blazePlaySound', newPlaySound);
    setPlaySound(newPlaySound);
  };

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            return 60;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (isGlobalRunning) {
      handleReset();
      setIsGlobalRunning(false);
    }
  }, [isGlobalRunning]);

  useEffect(() => {
    const soundIdx = localStorage.getItem('blazeSoundIdx') || 1;
    const isSoundPlaying = localStorage.getItem('blazePlaySound');
    setSounds(counterEffects[soundIdx]);
    if (isSoundPlaying) {
      setPlaySound(isSoundPlaying === 'true');
    }
  }, []);

  useEffect(() => {
    if (playSound && seconds > 0 && seconds < 5) {
      beepAudio.volume = sounds.volume;
      beepAudio.load();
      beepAudio.play();
    }
    if (playSound && seconds === 0) {
      beepFinishAudio.volume = sounds.volume;
      beepFinishAudio.load();
      beepFinishAudio.play();
    }
  }, [seconds]);

  useEffect(() => {
    setBeepAudio(new Audio(sounds.counterSoundPath));
    setBeepFinishAudio(new Audio(sounds.finishSoundPath));
  }, [sounds]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setSeconds(60);
    setIsRunning(true);
  };

  const handleSeconds = (increment) => {
    setSeconds((prevSeconds) => prevSeconds + increment);
  };

  return (
    <VStack
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position={'relative'}
    >
      <HStack>
        <Heading>範囲技</Heading>
        <SoundSelector
          sounds={sounds}
          setSounds={changeSounds}
          playSound={playSound}
          setPlaySound={changePlaySound} />
      </HStack>
      <HStack>
        <IconButton
          aria-label={'Minus'}
          icon={<FaMinus />}
          onClick={handleSeconds.bind(0, -1)} />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          backgroundColor={isRunning ? 'green.500' : 'gray.500'}
          width={24}
          height={24}
          marginBottom={4}
        >
          {isRunning ? (
              <CircularProgress
                value={seconds}
                size="full"
                thickness="8px">
                <CircularProgressLabel
                  fontSize="lg">
                  {seconds}
                </CircularProgressLabel>
              </CircularProgress>
          ) : (
              <Heading size="md">{seconds}</Heading>
          )}
        </Box>
        <IconButton
          aria-label={'Plus'}
          icon={<FaPlus />}
          onClick={handleSeconds.bind(0, 1)} />
      </HStack>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Button
          onClick={handleStartStop}
          colorScheme={isRunning ? 'red' : 'green'}
          size="lg"
          marginRight={2}
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button onClick={handleReset} size="lg" variant="outline">
            Reset
        </Button>
      </Box>
    </VStack>
  );
};

export default OneMinTimer;
