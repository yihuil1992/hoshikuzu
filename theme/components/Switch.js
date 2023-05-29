import {switchAnatomy} from '@chakra-ui/anatomy';
import {createMultiStyleConfigHelpers, defineStyle} from '@chakra-ui/react';

const {definePartsStyle, defineMultiStyleConfig} =
    createMultiStyleConfigHelpers(switchAnatomy.keys);

const baseStyleTrack = defineStyle((props) => {
  const {colorScheme: c} = props;

  return {
    bg: `${c}.200`,
    _checked: {
      bg: `${c}.200`,
    },
    _dark: {
      bg: `${c}.800`,
      _checked: {
        bg: `${c}.800`,
      },
    },
  };
});

const baseStyle = definePartsStyle((props) => ({
  track: baseStyleTrack(props),
}));

export const switchTheme = defineMultiStyleConfig({baseStyle});

