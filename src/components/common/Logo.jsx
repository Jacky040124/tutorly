import Image from 'next/image';
import LogoImage from '@/lib/img/LogoImage.png';

export function Logo({ className }) {
  return (
    <Image 
      src={LogoImage} 
      alt="Logo" 
      className={className}
      width={158}
      height={48}
    />
  );
}
