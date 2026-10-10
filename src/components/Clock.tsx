'use client';

import { useEffect, useState } from 'react';

/*
  Local time where he is. Renders nothing on the server and nothing without
  JavaScript, so the label simply has no time rather than a wrong one.
*/
export default function Clock({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    });
    const tick = () => setNow(format.format(new Date()));
    tick();
    /* Checked every fifteen seconds; React only re-renders when the minute changes. */
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  if (now === null) return null;
  return (
    <time>
      <span className="sr">local time </span>
      {now}
    </time>
  );
}
