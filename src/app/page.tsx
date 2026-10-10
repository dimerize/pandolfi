import Shell from '@/components/Shell';
import ClothStill from '@/components/cloth/ClothStill';
import { piece } from '@/lib/content';
import { site } from '@content/site';
import styles from './home.module.css';

/*
  The cloth. One viewport, nothing below it.

  A woven surface fills the viewport behind the words; it wears where it is
  touched and is mended while nobody is looking. The still version is in the
  HTML from the first byte; the machine fades in over it once it has proved
  itself. Nothing on the page explains any of this.
*/
export default async function Home() {
  const p = await piece(site.cloth.piece);
  const photo = p?.photos.find((ph) => ph.file === site.cloth.file) ?? p?.cover;

  return (
    <>
      {photo && <ClothStill photo={photo} />}
      <Shell current="home" wash className={styles.home}>
        <div className={styles.entry}>
          <h1 className={styles.name}>{site.brand}</h1>
          <p className={styles.line}>{site.line}</p>
        </div>
      </Shell>
    </>
  );
}
