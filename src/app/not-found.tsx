import Link from 'next/link';
import Shell from '@/components/Shell';
import styles from './not-found.module.css';

/* A seam that was not finished. */
export default function NotFound() {
  return (
    <Shell current="none">
      <div className={styles.lost}>
        <h1>nothing here</h1>
        <div className={styles.seam} aria-hidden="true" />
        <p className="print">
          <Link href="/" className={`${styles.home} tap`}>
            home
          </Link>
        </p>
      </div>
    </Shell>
  );
}
