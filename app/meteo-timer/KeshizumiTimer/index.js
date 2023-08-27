import {useCallback, useEffect, useState} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  HStack,
  IconButton,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';
import useSound from 'use-sound';
import {FaMinus, FaPlus} from 'react-icons/fa';
import s from './Keshizumi.module.css';
import {counterEffects} from '@/constants/soundEffects';
import SoundSelector from '@/components/SoundSelector';

const KeshizumiTimer = ({isGlobalRunning, setIsGlobalRunning}) => {
  const [seconds, setSeconds] = useState(30);
  const [isThirty, setIsThirty] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [sounds, setSounds] = useState({
    counterSoundPath: counterEffects[0].counterSoundPath,
    finishSoundPath: counterEffects[0].finishSoundPath,
  });
  const [beepPlay] = useSound(sounds.counterSoundPath);
  const [beepFinishPlay] = useSound(sounds.finishSoundPath);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setIsThirty(!isThirty);
            return isThirty ? 32 : 30;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isThirty]);

  useEffect(() => {
    if (isGlobalRunning) {
      handleReset();
      setIsGlobalRunning(false);
    }
  }, [isGlobalRunning]);

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
    setSeconds(30);
    setIsThirty(true);
    setIsRunning(true);
  };

  const handleSeconds = (increment) => {
    setSeconds((prevSeconds) => prevSeconds + increment);
  };

  const handleThirty = () => {
    setIsThirty(!isThirty);
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
        <SoundSelector
          sounds={sounds}
          setSounds={setSounds}
          playSound={playSound}
          setPlaySound={setPlaySound} />
      </HStack>
      <HStack>
        <Text>今は</Text>
        <Text
          className={isThirty ? s.active_text : s.idle_text}>
          30秒</Text>
        <Switch
          size={`lg`}
          isChecked={!isThirty}
          onChange={handleThirty}/>
        <Text
          className={isThirty ? s.idle_text : s.active_text}>
          32秒</Text>
        <Text>から</Text>
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
