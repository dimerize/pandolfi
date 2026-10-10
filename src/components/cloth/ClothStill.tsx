import Image from 'next/image';
import type { Photo } from '@/lib/content';
import styles from './ClothStill.module.css';

/*
  The still: the cloth as a photograph of itself. Unbleached ground with a
  faint thread grid, and the woven picture in its place. It is in the HTML
  from the first byte and is what you get with JavaScript off, without WebGL,
  on a weak device, on a data-saving connection, or with reduced motion.
  The machine, when it comes, fades in over it; this never goes away.
*/
export default function ClothStill({ photo }: { photo: Photo }) {
  return (
    <div className={styles.cloth} data-cloth-still>
      <div className={styles.weave} aria-hidden="true" />
      <Image
        className={styles.photo}
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes="(max-width: 40rem) 72vw, 38vw"
        priority
      />
    </div>
  );
}
