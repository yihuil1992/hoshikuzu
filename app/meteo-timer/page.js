'use client';
import KeshizumiTimer from '@/app/meteo-timer/KeshizumiTimer';
import OneMinTimer from '@/app/meteo-timer/OneMinTimer';
import {VStack} from '@chakra-ui/react';

const MeteoTimerPage = () => {
  return (
    <VStack
      height={'100vh'}
      justifyContent={'space-around'}>
      <KeshizumiTimer />
      <OneMinTimer />
    </VStack>
  );
};

export default MeteoTimerPage;
