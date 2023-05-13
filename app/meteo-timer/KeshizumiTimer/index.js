import {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading, IconButton,
  useColorMode,
} from '@chakra-ui/react';
import useSound from 'use-sound';
import {FaVolumeMute, FaVolumeUp} from 'react-icons/fa';

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
        if (isThirty && seconds === 0) {
          setSeconds(32);
          setIsThirty(false);
        } else if (!isThirty && seconds === 0) {
          setSeconds(29);
          setIsThirty(true);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [seconds, isThirty, isRunning]);

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
    setSeconds(29);
    setIsThirty(true);
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
      <Heading>消し炭</Heading>
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
                thickness="8px"
              >
                <CircularProgressLabel
                  fontSize={'lg'}>{seconds}</CircularProgressLabel>
              </CircularProgress>
          ) : (
              <Heading size="md" color="white">
                {seconds}
              </Heading>
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

export default KeshizumiTimer;
