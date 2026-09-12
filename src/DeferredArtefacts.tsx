import { useEffect, useRef, useState, type CSSProperties } from 'react';
import artefacts from './content/artefacts.json';

// Shared across both sections: never start competing per-section queues.
let queue: Promise<void> = Promise.resolve();
// Raise or lower this value (0–1) to tune how much of the viewport an artefact enters before animating.
const ARTEFACT_REVEAL_ENTRY_FRACTION = 0.1;
function idle() {
  return new Promise<void>(resolve => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 1500 });
    else setTimeout(resolve, 100);
  });
}
function afterLoad() {
  return new Promise<void>(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', () => resolve(), { once: true });
  });
}

export default function DeferredArtefacts({ section }: { section: 'work' | 'about' }) {
  const root = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    for (const asset of artefacts.filter(item => item.section === section)) {
      queue = queue.then(async () => {
        await afterLoad();
        await idle();
        if (cancelled || (asset.mobile === 'hide' && window.matchMedia('(max-width: 1100px)').matches)) return;
        const img = new Image();
        img.decoding = 'async';
        img.fetchPriority = 'low';
        try {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Decorative image unavailable'));
            img.src = asset.src;
          });
          await img.decode();
          if (!cancelled) setLoaded(previous => [...previous, asset.id]);
        } catch { /* A failed decoration must not block the queue or content. */ }
      });
    }
    return () => { cancelled = true; };
  }, [section]);

  useEffect(() => {
    if (!loaded.length) return;
    let frame = 0;
    const revealAtViewportMiddle = () => {
      frame = 0;
      root.current?.querySelectorAll<HTMLElement>('[data-crop-percent]').forEach(element => {
        if (element.classList.contains('is-revealed')) return;
        const crop = Number(element.dataset.cropPercent) / 100;
        const anchor = element.dataset.anchor;
        element.style.setProperty('--offset-x', 'var(--base-offset-x)');
        const image = element.querySelector('img');
        if (!image || !crop || !anchor) return;
        const bounds = image.getBoundingClientRect();
        const entryShift = element.classList.contains('motion-left') ? -60 : element.classList.contains('motion-right') ? 60 : 0;
        const currentlyVisible = anchor === 'left' ? bounds.right - entryShift : window.innerWidth - bounds.left + entryShift;
        const desiredVisible = bounds.width * crop;
        const adjustment = anchor === 'left' ? desiredVisible - currentlyVisible : currentlyVisible - desiredVisible;
        element.style.setProperty('--offset-x', `calc(var(--base-offset-x) + ${adjustment}px)`);
      });
      const revealLine = window.innerHeight * (1 - ARTEFACT_REVEAL_ENTRY_FRACTION);
      const newlyRevealed = loaded.filter(id => {
        if (revealed.includes(id)) return false;
        const element = root.current?.querySelector<HTMLElement>(`[data-artefact-id="${id}"]`);
        if (!element) return false;
        const bounds = element.getBoundingClientRect();
        return bounds.top + bounds.height / 2 <= revealLine && bounds.bottom > 0;
      });
      if (newlyRevealed.length) setRevealed(previous => [...previous, ...newlyRevealed]);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(revealAtViewportMiddle);
    };
    revealAtViewportMiddle();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [loaded, revealed]);

  return <div ref={root} className="artefacts" aria-hidden="true">
    {artefacts.filter(asset => loaded.includes(asset.id)).map(asset => <div key={asset.id}
      data-artefact-id={asset.id}
      data-anchor={asset.anchor}
      data-crop-percent={asset.visiblePercent}
      className={`artefact anchor-${asset.anchor} mobile-${asset.mobile} motion-${asset.motion}${revealed.includes(asset.id) ? ' is-revealed' : ''}`}
      style={{ '--size': `${asset.size}px`, '--top': asset.top, '--rotation': `${asset.rotation}deg`, '--base-offset-x': `${asset.offsetX}px`, '--offset-x': 'var(--base-offset-x)', '--alpha': asset.opacity } as CSSProperties}>
      <img src={asset.src} alt="" width={asset.width} height={asset.height} decoding="async" draggable={false} />
    </div>)}
  </div>;
}

