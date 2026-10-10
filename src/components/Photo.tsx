import Image from 'next/image';
import type { Photo as PhotoData } from '@/lib/content';
import styles from './Photo.module.css';

/*
  A photograph, untreated. Native aspect ratio, no crop, no corner radius, no
  shadow, no hover. While it loads, the same photograph at sixteen pixels
  wide sits behind it, scaled up pixelated: the truth about a small image,
  rather than a blur's pretence of a smooth one. The swap is a cut.
*/
interface Props {
  photo: PhotoData;
  sizes: string;
  priority?: boolean;
}

export default function Photo({ photo, sizes, priority = false }: Props) {
  return (
    <span
      className={styles.frame}
      style={{ aspectRatio: `${photo.width} / ${photo.height}`, backgroundImage: `url("${photo.placeholder}")` }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        priority={priority}
        className={styles.img}
      />
    </span>
  );
}
