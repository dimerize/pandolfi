'use client';

import { useRef, type PointerEvent as ReactPointerEvent, type MouseEvent,
  type FocusEvent } from 'react';
import styles from './DoorLink.module.css';

type Props = {
  href: string;
  label: string;
  onActiveChange?: (active: boolean) => void;
};

type Gesture = { pointerId: number; cancelled: boolean };

function inside(element: HTMLElement, x: number, y: number): boolean {
  const rect = element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

/** The doorway stays a real link, with a press that can be cancelled by sliding away. */
export default function DoorLink({ href, label, onActiveChange }: Props) {
  const gesture = useRef<Gesture | null>(null);
  const clickResult = useRef<'allow' | 'block' | null>(null);
  const active = useRef(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  const blockedHover = useRef(false);

  const setActive = (next: boolean) => {
    if (active.current === next) return;
    active.current = next;
    onActiveChange?.(next);
  };

  const updateActive = () => {
    if (gesture.current?.cancelled || blockedHover.current) {
      setActive(false);
    } else {
      setActive(Boolean(gesture.current || hovered.current || focused.current));
    }
  };

  const cancel = () => {
    if (!gesture.current || gesture.current.cancelled) return;
    gesture.current.cancelled = true;
    blockedHover.current = true;
    updateActive();
  };

  const pointerEnter = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === 'touch') return;
    hovered.current = true;
    if (!gesture.current) blockedHover.current = false;
    updateActive();
  };

  const pointerLeave = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== 'touch') hovered.current = false;
    if (gesture.current?.pointerId === event.pointerId) cancel();
    else updateActive();
  };

  const pointerDown = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (!event.isPrimary || event.button !== 0) {
      if (event.pointerType === 'touch' && !event.isPrimary) {
        cancel();
        clickResult.current = 'block';
      }
      return;
    }
    clickResult.current = 'block';
    gesture.current = { pointerId: event.pointerId, cancelled: false };
    blockedHover.current = false;
    updateActive();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Leaving the hit area still cancels if capture is unavailable.
    }
  };

  const pointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    if (!inside(event.currentTarget, event.clientX, event.clientY)) {
      cancel();
    }
  };

  const pointerUp = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    if (!inside(event.currentTarget, event.clientX, event.clientY)) cancel();
    clickResult.current = gesture.current.cancelled ? 'block' : 'allow';
    blockedHover.current = gesture.current.cancelled;
    gesture.current = null;
    updateActive();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const pointerCancel = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    clickResult.current = 'block';
    gesture.current = null;
    blockedHover.current = true;
    updateActive();
  };

  const lostCapture = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    clickResult.current = 'block';
    gesture.current = null;
    blockedHover.current = true;
    updateActive();
  };

  const focus = (event: FocusEvent<HTMLAnchorElement>) => {
    focused.current = event.currentTarget.matches(':focus-visible');
    if (focused.current) blockedHover.current = false;
    updateActive();
  };

  const blur = () => {
    focused.current = false;
    updateActive();
  };

  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    // A primary pointer click arrives after pointerup. Keyboard Enter clears
    // a stale cancelled result before the browser dispatches its own click.
    const result = clickResult.current;
    clickResult.current = null;
    if (result === 'block') event.preventDefault();
  };

  return (
    <a className={styles.door} href={href}
      draggable={false} onDragStart={(event) => event.preventDefault()}
      aria-label={label}
      onPointerEnter={pointerEnter} onPointerLeave={pointerLeave}
      onPointerDown={pointerDown} onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerCancel} onLostPointerCapture={lostCapture}
      onFocus={focus} onBlur={blur}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          clickResult.current = null;
          blockedHover.current = false;
          focused.current = true;
          updateActive();
        }
      }}
      onClick={click} />
  );
}
