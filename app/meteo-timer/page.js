'use client';
import KeshizumiTimer from '@/app/meteo-timer/KeshizumiTimer';

import {Button, Divider, HStack, VStack} from '@chakra-ui/react';
import {useState} from 'react';
import BlazeTimer from '@/app/meteo-timer/BlazeTimer';

const MeteoTimerPage = () => {
  const [resetSwitch, setResetSwitch] = useState(false);
  const [isKeshizumiRunning, setIsKeshizumiRunning] = useState(false);
  const [isBlazeRunning, setIsBlazeRunning] = useState(false);

  const handleReset = () => {
    setResetSwitch(true);
  };


  const startBoth = () => {
    setIsKeshizumiRunning(true);
    setIsBlazeRunning(true);
  };

  const stopBoth = () => {
    setIsKeshizumiRunning(false);
    setIsBlazeRunning(false);
  };

  return (
    <VStack>
      <KeshizumiTimer
        resetSwitch={resetSwitch}
        setResetSwitch={setResetSwitch}
        isRunning={isKeshizumiRunning}
        setIsRunning={setIsKeshizumiRunning}/>
      <BlazeTimer
        resetSwitch={resetSwitch}
        setResetSwitch={setResetSwitch}
        isRunning={isBlazeRunning}
        setIsRunning={setIsBlazeRunning}/>
      <Divider />
      <HStack>
        <Button
          colorScheme={isBlazeRunning || isKeshizumiRunning ? 'red' : 'green'}
          onClick={isBlazeRunning || isKeshizumiRunning ? stopBoth : startBoth}>
          {isBlazeRunning || isKeshizumiRunning ? 'Stop Both' : 'Start Both'}
        </Button>
        <Button
          colorScheme={'blue'}
          onClick={handleReset}>
              Reset Both
        </Button>
      </HStack>
    </VStack>
  );
};

export default MeteoTimerPage;
