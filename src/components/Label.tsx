import { isPlaceholder, site } from '@content/site';
import Clock from './Clock';
import Wash from './Wash';
import styles from './Label.module.css';

/*
  The label sewn inside the garment: who made it, where to find them. One
  line at the bottom of every page. The time says where he is without the
  words "based in"; it is filled in by JavaScript and absent without it.
*/
export default function Label({ wash }: { wash: boolean }) {
  const emailTodo = isPlaceholder(site.email);
  const cityTodo = isPlaceholder(site.city);

  return (
    <footer className={styles.label}>
      <ul className={styles.list}>
        <li>
          {emailTodo ? (
            <span className={`${styles.item} print todo`}>
              <Envelope />
              {site.email}
            </span>
          ) : (
            <a className={`${styles.item} ${styles.link} print`} href={`mailto:${site.email}`}>
              <Envelope />
              <span className="sr">email. </span>
              {site.email}
            </a>
          )}
        </li>
        <li>
          <a className={`${styles.item} ${styles.link} print`} href={site.instagramUrl} rel="me noopener">
            <Camera />
            <span className="sr">instagram. </span>@{site.handle}
          </a>
        </li>
        <li className={`${styles.item} print ${cityTodo ? 'todo' : ''}`}>
          <span>{site.city}</span>
          <Clock timeZone={site.timeZone} />
        </li>
        {wash && (
          <li>
            <Wash />
          </li>
        )}
      </ul>
    </footer>
  );
}

/* Line icons to match the stitches: one stroke, no fill, no icon library. */
function Envelope() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" />
      <path d="M3 6.5 12 13l9-6.5" />
    </svg>
  );
}

function Camera() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
