import Link from 'next/link';
import { nav, site } from '@content/site';
import styles from './Nav.module.css';

export type Current = 'home' | 'work' | 'about' | 'none';

/*
  One line of small text at the top left. The mark links home. No hamburger,
  no fixed bar: it scrolls with the page, and on the home page sits on the
  cloth. The current item is one of the three places the signal appears.
*/
export default function Nav({ current }: { current: Current }) {
  const cls = (on: boolean) => [styles.link, 'print', on ? styles.current : ''].join(' ').trim();
  return (
    <nav className={styles.nav} aria-label="primary">
      <Link href="/" className={cls(current === 'home')} aria-current={current === 'home' ? 'page' : undefined}>
        <span aria-hidden="true">{site.mark}</span>
        <span className="sr">{site.brand}, home</span>
      </Link>
      {nav.map((item) => {
        const on = current === item.label;
        return (
          <Link key={item.href} href={item.href} className={cls(on)} aria-current={on ? 'page' : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
