import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { pieces } from '@/lib/content';
import styles from './work.module.css';

export const metadata: Metadata = {
  title: 'work',
  description: 'the pieces, newest first: what they are, what they are made of, when.',
};

/*
  A spec sheet. Each row is number, title, materials, year, separated by
  stitched rules. No thumbnails: the list is the index and the photographs
  are on the piece.
*/
export default async function WorkPage() {
  const all = await pieces();

  return (
    <Shell current="work">
      <h1 className="sr">work</h1>
      <ol className={styles.index}>
        {all.map((p) => (
          <li key={p.slug} className="seam">
            <Link href={`/work/${p.slug}`} className={styles.row}>
              <span className={`${styles.number} print`}>{p.number}</span>
              <span className={styles.title}>{p.title}</span>
              <span className={styles.meta}>
                <span className={`${styles.materials} print`}>{p.materials.join(', ')}</span>
                <span className={`${styles.year} print`}>{p.year ?? ''}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="seam" aria-hidden="true" />
    </Shell>
  );
}
