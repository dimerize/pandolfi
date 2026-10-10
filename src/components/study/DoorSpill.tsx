import { useId } from 'react';
import styles from './DoorSpill.module.css';

const PHOTO = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/study/nothing-lasts-forever.png`;

/** Photographic light reflected from the small door onto the existing ground. */
export default function DoorSpill({ active = false }: { active?: boolean }) {
  const id = useId().replace(/:/g, '');

  return (
    <svg className={styles.spill} data-active={active ? 'true' : undefined}
      viewBox="0 0 610 710" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-falloff`} gradientUnits="userSpaceOnUse"
          x1="528" y1="600" x2="504" y2="678">
          <stop offset="0" stopColor="white" stopOpacity="0.94" />
          <stop offset="0.42" stopColor="white" stopOpacity="0.59" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-feather`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4.2" />
        </filter>
        <mask id={`${id}-pavement`} maskUnits="userSpaceOnUse"
          x="440" y="588" width="150" height="105">
          <path d="M520 600 Q541 603 566 601 L566 613 Q560 631 556 670
            Q509 659 461 678 Q486 639 512 609 Z"
            fill={`url(#${id}-falloff)`} filter={`url(#${id}-feather)`} />
        </mask>
        <linearGradient id={`${id}-wall-falloff`} gradientUnits="userSpaceOnUse"
          x1="521" y1="589" x2="496" y2="642">
          <stop offset="0" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-wall`} maskUnits="userSpaceOnUse"
          x="486" y="570" width="49" height="86">
          <path d="M520 576 Q517 591 519 606 Q510 620 495 647
            L487 647 Q500 613 509 586 Z"
            fill={`url(#${id}-wall-falloff)`} filter={`url(#${id}-feather)`} />
        </mask>
        <filter id={`${id}-lift`} colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.72" intercept="0.025" />
            <feFuncG type="linear" slope="1.83" intercept="0.035" />
            <feFuncB type="linear" slope="1.57" intercept="0.018" />
          </feComponentTransfer>
        </filter>
      </defs>

      <image className={styles.pavement} href={PHOTO} width="610" height="710"
        preserveAspectRatio="none" mask={`url(#${id}-pavement)`}
        filter={`url(#${id}-lift)`} />
      <image className={styles.wall} href={PHOTO} width="610" height="710"
        preserveAspectRatio="none" mask={`url(#${id}-wall)`}
        filter={`url(#${id}-lift)`} />
      <path className={styles.glow}
        d="M521 605 Q540 607 565 604 L557 658 Q514 649 471 669 Q498 629 521 605 Z"
        fill="#dcf2d2" mask={`url(#${id}-pavement)`} />
    </svg>
  );
}
