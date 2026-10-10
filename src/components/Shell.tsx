import type { ReactNode } from 'react';
import Nav, { type Current } from './Nav';
import Label from './Label';

/*
  The page: nav at the top left, the content, the label at the bottom.
  Every route renders through this, and tells it which nav item is current;
  a Server Component layout cannot know the route, and a client one would
  ship JavaScript to pages that need none.
*/
interface Props {
  current: Current;
  /** The home page's label carries one more word, which resets the cloth. */
  wash?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Shell({ current, wash = false, className, children }: Props) {
  return (
    <div className={['page', className].filter(Boolean).join(' ')}>
      <Nav current={current} />
      <main id="main">{children}</main>
      <Label wash={wash} />
    </div>
  );
}
