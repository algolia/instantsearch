import React, { useEffect, useState } from 'react';

/**
 * A visually hidden live region that announces `message` only once it has
 * been stable for `delay` ms, so screen readers hear the outcome of a search
 * or an agent turn, never every streamed token.
 */
export function LiveAnnouncer({
  message,
  delay = 800,
}: {
  message: string;
  delay?: number;
}) {
  const [announced, setAnnounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(message), delay);
    return () => clearTimeout(timer);
  }, [message, delay]);

  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announced}
    </div>
  );
}
