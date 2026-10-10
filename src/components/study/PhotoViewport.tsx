'use client';

import { useEffect, type ReactNode } from 'react';
import styles from './PhotoPage.module.css';

/** A fixed photographic page that keeps one-finger cuts from scrolling Safari. */
export default function PhotoViewport({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyHeight: body.style.height,
    };

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.height = '100%';

    // Safari can still pull a short, locked page down. The explicit passive
    // option lets this cancel the first one-finger move without blocking taps
    // on the doorway or two-finger zoom gestures.
    const preventSingleFingerPan = (event: TouchEvent) => {
      if (event.touches.length === 1 && event.cancelable) event.preventDefault();
    };
    document.addEventListener('touchmove', preventSingleFingerPan, { capture: true, passive: false });

    return () => {
      document.removeEventListener('touchmove', preventSingleFingerPan, true);
      html.style.overflow = previous.htmlOverflow;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      html.style.height = previous.htmlHeight;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      body.style.height = previous.bodyHeight;
    };
  }, []);

  return <main id="main" className={styles.page} data-photo-viewport="">{children}</main>;
}
