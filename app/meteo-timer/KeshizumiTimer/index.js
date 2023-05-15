import {useCallback, useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading, HStack, IconButton,
  useColorMode, VStack,
} from '@chakra-ui/react';
import useSound from 'use-sound';
import {FaMinus, FaPlus, FaVolumeMute, FaVolumeUp} from 'react-icons/fa';

const KeshizumiTimer = () => {
  const [seconds, setSeconds] = useState(29);
  const [isThirty, setIsThirty] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [beepPlay] = useSound('/assets/sounds/LAPUTA_counter_2.mp3');
  const [beepFinishPlay] = useSound('/assets/sounds/LAPUTA_counter_3.mp3');
  const {colorMode} = useColorMode();

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setIsThirty(!isThirty);
            return isThirty ? 32 : 29;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isThirty]);

  const playBeep = useCallback(() => {
    if (playSound && seconds > 0 && seconds < 5) {
      beepPlay();
    }
    if (playSound && seconds === 0) {
      beepFinishPlay();
    }
  }, [playSound, seconds, beepPlay, beepFinishPlay]);

  useEffect(() => {
    playBeep();
  }, [playBeep]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setSeconds(29);
    setIsThirty(true);
    setIsRunning(true);
  };

  const toggleSound = () => {
    setPlaySound(!playSound);
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
        <Heading>消し炭</Heading>
        <IconButton
          onClick={toggleSound}
          aria-label="Toggle sound"
          icon={playSound ? <FaVolumeUp /> : <FaVolumeMute />}
          size="lg"
          variant="ghost"
          marginRight={2}
          colorScheme={colorMode === 'dark' ? 'white' : 'blackAlpha'}
        />
      </HStack>
      <HStack>
        <IconButton
          aria-label={'Minus'}
          icon={<FaMinus />}
          onClick={handleSeconds.bind(null, -1)} />
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
          onClick={handleSeconds.bind(null, 1)} />
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

export default KeshizumiTimer;
