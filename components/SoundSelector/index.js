import {Box, Button, IconButton, useColorMode} from '@chakra-ui/react';
import {counterEffects} from '@/constants/soundEffects';
import {FaVolumeMute, FaVolumeUp} from 'react-icons/fa';

const SoundSelector = ( {sounds, setSounds, playSound, setPlaySound} ) => {
  const {colorMode} = useColorMode();
  const selectedBg = colorMode === 'dark' ? 'blue.800' : 'blue.100';
  return (
    <Box>
      {counterEffects.map((counterEffect, idx) => (
        <Button
          key={counterEffect.name}
          aria-label={counterEffect.name}
          leftIcon={<FaVolumeUp />}
          onClick={() => {
            setSounds(counterEffect);
            setPlaySound(true);
          }}
          background={
              (counterEffect.counterSoundPath === sounds.counterSoundPath &&
                  playSound) ? selectedBg : ''
          }
          size="sm"
          variant="ghost"
          colorScheme={colorMode === 'dark' ? 'white' : 'blackAlpha'} >
          {idx + 1}
        </Button>
      ))}
      <IconButton
        key={'mute'}
        aria-label={'mute'}
        icon={<FaVolumeMute /> }
        onClick={() => setPlaySound(false)}
        background={
                !playSound ? selectedBg : ''
        }
        size="sm"
        variant="ghost"
        colorScheme={colorMode === 'dark' ? 'white' : 'blackAlpha'} />
    </Box>
  );
};

export default SoundSelector;
