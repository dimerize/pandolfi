'use client';

import { WASH_EVENT, wash } from './cloth/persist';
import styles from './Wash.module.css';

/*
  One word in the home page's label. It clears the wear and the mends, and
  the cloth is new. Nothing confirms it and nothing explains it.
*/
export default function Wash() {
  return (
    <button
      type="button"
      className={`${styles.wash} print`}
      onClick={() => {
        wash();
        window.dispatchEvent(new Event(WASH_EVENT));
      }}
    >
      wash
    </button>
  );
}
