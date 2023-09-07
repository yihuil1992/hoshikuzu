import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  HStack,
  IconButton,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import {FaMinus, FaPlus, FaVolumeMute, FaVolumeUp} from 'react-icons/fa';
import {counterEffects} from '@/constants/soundEffects';
import {useEffect, useState} from 'react';
const CountdownTimer = ({
  title,
  seconds,
  isRunning,
  customComponent,
  soundId,
  minusHandler,
  plusHandler,
  startStopHandler,
  resetHandler,
  switchSoundHandler,
}) => {
  const currentSoundSetting = counterEffects.find((effect) => {
    return effect.id === soundId;
  }) || counterEffects[0];
  const [beepAudio, setBeepAudio] = useState(null);
  const [beepFinishAudio, setBeepFinishAudio] = useState(null);

  const {colorMode} = useColorMode();
  const selectedBg = colorMode === 'dark' ? 'blue.800' : 'blue.100';

  useEffect(() => {
    if (currentSoundSetting.playSound) {
      setBeepAudio(new Audio(currentSoundSetting.counterSoundPath));
      setBeepFinishAudio(new Audio(currentSoundSetting.finishSoundPath));
    }
  }, [currentSoundSetting]);

  useEffect(() => {
    if (currentSoundSetting.playSound && seconds < 5) {
      beepAudio.volume = currentSoundSetting.volume;
      beepAudio.load();
      beepAudio.play();
    }

    if (currentSoundSetting.playSound && seconds === 0) {
      beepFinishAudio.volume = currentSoundSetting.volume;
      beepFinishAudio.load();
      beepFinishAudio.play();
    }
  }, [seconds]);

  return (
    <VStack
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position={'relative'}
    >
      <HStack>
        <Heading>{title}</Heading>
        <Box>
          {counterEffects.map((counterEffect) => (
            <>
              {counterEffect.playSound ?
                        (<Button
                          key={`${counterEffect.id}-${title}`}
                          aria-label={counterEffect.name}
                          leftIcon={<FaVolumeUp />}
                          onClick={() => switchSoundHandler(counterEffect.id)}
                          background={
                                counterEffect.id === currentSoundSetting.id ?
                                    selectedBg : ''
                          }
                          size="sm"
                          variant="ghost"
                          colorScheme={colorMode === 'dark' ?
                              'white' : 'blackAlpha'} >
                          {counterEffect.id}
                        </Button>) :
                        (<IconButton
                          key={'mute'}
                          aria-label={'mute'}
                          icon={<FaVolumeMute /> }
                          onClick={() => switchSoundHandler(-1)}
                          background={
                                currentSoundSetting.id === counterEffect.id ?
                                    selectedBg : ''}
                          size="sm"
                          variant="ghost"
                          colorScheme={colorMode === 'dark' ?
                                'white' : 'blackAlpha'} />)}
            </>))}
        </Box>
      </HStack>
      {customComponent}
      <HStack>
        <IconButton
          aria-label={'Minus'}
          icon={<FaMinus />}
          onClick={minusHandler} />
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
          onClick={plusHandler} />
      </HStack>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Button
          onClick={startStopHandler}
          colorScheme={isRunning ? 'red' : 'green'}
          size="lg"
          marginRight={2}
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button onClick={resetHandler} size="lg" variant="outline">
                    Reset
        </Button>
      </Box>
    </VStack>
  );
};

export default CountdownTimer;
