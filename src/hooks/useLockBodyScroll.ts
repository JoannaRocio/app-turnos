import { useEffect } from 'react';

const LOCK_COUNT_ATTR = 'data-modal-lock-count';
const LOCK_CLASS = 'modal-open';

const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    const currentCount = Number(body.getAttribute(LOCK_COUNT_ATTR) ?? '0');
    const nextCount = currentCount + 1;

    body.setAttribute(LOCK_COUNT_ATTR, String(nextCount));
    body.classList.add(LOCK_CLASS);

    return () => {
      const latestCount = Number(body.getAttribute(LOCK_COUNT_ATTR) ?? '1');
      const updatedCount = Math.max(0, latestCount - 1);

      if (updatedCount === 0) {
        body.removeAttribute(LOCK_COUNT_ATTR);
        body.classList.remove(LOCK_CLASS);
        return;
      }

      body.setAttribute(LOCK_COUNT_ATTR, String(updatedCount));
    };
  }, [isLocked]);
};

export default useLockBodyScroll;
