import { useEffect, useRef, useState, type CSSProperties } from 'react';
import artefacts from './content/artefacts.json';

// Shared across both sections: never start competing per-section queues.
let queue: Promise<void> = Promise.resolve();
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
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const container = root.current!.parentElement!;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0 });
    observer.observe(container);
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
    return () => { cancelled = true; observer.disconnect(); };
  }, [section]);

  return <div ref={root} className={`artefacts${revealed ? ' is-revealed' : ''}`} aria-hidden="true">
    {artefacts.filter(asset => loaded.includes(asset.id)).map(asset => <div key={asset.id}
      className={`artefact anchor-${asset.anchor} mobile-${asset.mobile} motion-${asset.motion}`}
      style={{ '--size': `${asset.size}px`, '--top': asset.top, '--rotation': `${asset.rotation}deg`, '--alpha': asset.opacity } as CSSProperties}>
      <img src={asset.src} alt="" width={asset.width} height={asset.height} decoding="async" draggable={false} />
    </div>)}
  </div>;
}

