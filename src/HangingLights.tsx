import { useEffect, useRef } from 'react';

export default function HangingLights() {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const lights = root.current;
    const marker = trigger.current;
    if (!lights || !marker || !('IntersectionObserver' in window)) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | undefined;

    const observe = () => {
      observer?.disconnect();
      if (reducedMotion.matches) {
        lights.classList.remove('is-swaying');
        return;
      }
      // Pixel margins use viewport height; percentage root margins use width.
      observer = new IntersectionObserver(([entry]) => {
        lights.classList.toggle('is-swaying', entry.isIntersecting);
      }, { rootMargin: `0px 0px -${window.innerHeight * 0.15}px 0px` });
      observer.observe(marker);
    };
    const update = () => {
      if (document.readyState === 'complete') observe();
    };
    // Keep observer setup out of the initial page load.
    update();
    window.addEventListener('load', observe, { once: true });
    window.addEventListener('resize', update);
    reducedMotion.addEventListener('change', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('load', observe);
      window.removeEventListener('resize', update);
      reducedMotion.removeEventListener('change', update);
    };
  }, []);

  return <div ref={root} className="hanging-lights" aria-hidden="true">
    <i /><i /><i /><i />
    <span ref={trigger} className="lights-trigger" />
  </div>;
}
