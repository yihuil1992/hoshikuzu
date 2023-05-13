import {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';
import {FaVolumeUp, FaVolumeMute} from 'react-icons/fa';
import useSound from 'use-sound';

const OneMinTimer = () => {
  const [seconds, setSeconds] = useState(59);
  const [isRunning, setIsRunning] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [beepPlay] = useSound('/assets/sounds/LAPUTA_counter_2.mp3');
  const [beepFinishPlay] = useSound('/assets/sounds/LAPUTA_counter_3.mp3');
  const {colorMode} = useColorMode();

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds === 0) {
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [seconds, isRunning]);

  useEffect(() => {
    if (playSound && seconds > 0 && seconds < 5) {
      beepPlay();
    }
    if (playSound && seconds === 0) {
      beepFinishPlay();
    }
  }, [seconds, playSound]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setSeconds(59);
    setIsRunning(true);
  };

  const toggleSound = () => {
    setPlaySound(!playSound);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position={'relative'}
    >
      <Box
        position={'absolute'}
        right={0}
        top={0}>
        <IconButton
          onClick={toggleSound}
          aria-label="Toggle sound"
          icon={playSound ? <FaVolumeUp /> : <FaVolumeMute />}
          size="lg"
          variant="ghost"
          marginRight={2}
          colorScheme={colorMode === 'dark' ? 'white' : 'blackAlpha'}
        />
      </Box>
      <Heading>範囲技</Heading>
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
    </Box>
  );
};

export default OneMinTimer;
