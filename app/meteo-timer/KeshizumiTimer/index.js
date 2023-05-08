import {useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading} from '@chakra-ui/react';

const KeshizumiTimer = () => {
  const [seconds, setSeconds] = useState(29);
  const [isThirty, setIsThirty] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

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

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setSeconds(29);
    setIsThirty(true);
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

export default KeshizumiTimer;
