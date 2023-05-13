import {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading} from '@chakra-ui/react';
import useSound from 'use-sound';

const OneMinTimer = () => {
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [beepPlay] = useSound('/assets/sounds/LAPUTA_counter_2.mp3');
  const [beepFinishPlay] = useSound('/assets/sounds/LAPUTA_counter_3.mp3');

  useEffect(() => {
    let interval = null;
    if (isRunning && seconds === 0) {
      setSeconds(59);
    } else if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [seconds, isRunning]);

  useEffect(() => {
    if (seconds > 0 && seconds < 5) {
      beepPlay();
    }
    if (seconds === 0) {
      beepFinishPlay();
    }
  }, [seconds]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setSeconds(59);
    setIsRunning(true);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
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
                thickness="8px"
                color="white"
              >
                <CircularProgressLabel
                  fontSize={'lg'}>{seconds}</CircularProgressLabel>
              </CircularProgress>
          ) : (
              <Heading size="md" >
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

export default OneMinTimer;
