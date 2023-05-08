import {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading} from '@chakra-ui/react';

const OneMinTimer = () => {
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

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
      backgroundColor="gray.50"
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

export default OneMinTimer;
