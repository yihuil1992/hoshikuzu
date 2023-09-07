import {HStack, Switch, Text} from '@chakra-ui/react';
import s from './KBaseSeconds.module.css';

const KBaseSeconds = ({
  isThirty,
  switchThirty,
}) => {
  return (
    <HStack>
      <Text>今は</Text>
      <Text
        className={isThirty ? s.active_text : s.idle_text}>
                30秒</Text>
      <Switch
        size={`lg`}
        isChecked={!isThirty}
        onChange={switchThirty}/>
      <Text
        className={isThirty ? s.idle_text : s.active_text}>
                32秒</Text>
      <Text>から</Text>
    </HStack>
  );
};

export default KBaseSeconds;
