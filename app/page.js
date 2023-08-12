// eslint-disable-next-line require-jsdoc
import Image from 'next/image';

// eslint-disable-next-line require-jsdoc
export default function Home() {
  return (
    <div>
      ほしくずへようこそ
      <Image
        src={'https://cdn.ototrading.com/image/Screenshot.png'} alt={'screenshot'}
        width={500}
        height={500}/>
    </div>
  );
}
