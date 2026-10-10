import type { Viewport } from 'next';
import Billboard from '@/components/study/Billboard';
import styles from '@/components/study/PhotoPage.module.css';

export const viewport: Viewport = { themeColor: '#050807', colorScheme: 'dark' };

export default function Home() {
  return (
    <main id="main" className={styles.page}>
      <h1 className="sr">i crave imperfection</h1>
      <Billboard />
    </main>
  );
}
