'use client';
import KeshizumiTimer from '@/app/meteo-timer/KeshizumiTimer';
import OneMinTimer from '@/app/meteo-timer/OneMinTimer';
import {Button, Divider, VStack} from '@chakra-ui/react';
import {useState} from 'react';

const MeteoTimerPage = () => {
  const [isGlobalRunning, setIsGlobalRunning] = useState(false);

  const handleReset = () => {
    setIsGlobalRunning(true);
  };

  return (
    <VStack>
      <KeshizumiTimer
        isGlobalRunning={isGlobalRunning}
        setIsGlobalRunning={setIsGlobalRunning}/>
      <OneMinTimer
        isGlobalRunning={isGlobalRunning}
        setIsGlobalRunning={setIsGlobalRunning}/>
      <Divider />
      <Button
        colorScheme={'blue'}
        onClick={handleReset}>
            Reset Both
      </Button>
    </VStack>
  );
};

export default MeteoTimerPage;
