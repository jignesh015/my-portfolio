import { useEffect, useRef, useState, type CSSProperties } from 'react';
import site from './content/site.json';
import layers from './content/hero-layers.json';
import './hero-portrait.css';

type Layer = typeof layers[number];
// Furniture, person and equipment share one projection; the window stays independent.
const core = ['workstation'];

function PortraitLayer({ layer, visible, onLoad, onError }: { layer: Layer; visible: boolean; onLoad: (id: string) => void; onError: () => void }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!visible || !element.current) return;
    const node = element.current;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, finished = false, frame = 0, timeout = 0;
    let stop = () => {};
    const finish = () => {
      finished = true;
      stop(); cancelAnimationFrame(frame); clearTimeout(timeout);
      node.style.opacity = '1'; node.style.transform = 'none';
    };
    const changed = () => { if (preference.matches) finish(); };
    preference.addEventListener('change', changed);
    if (preference.matches) finish();
    else {
      // A stalled animation download must never leave decoded artwork hidden.
      timeout = window.setTimeout(finish, 1500);
      void import('@tweenjs/tween.js').then(({ Tween, Easing }) => {
        if (disposed || finished) return;
        if (preference.matches) { finish(); return; }
        const state = { opacity: 0, scale: .985, y: 6 };
        const tween = new Tween(state).to({ opacity: 1, scale: 1, y: 0 }, 600)
          .delay(layer.delay).easing(Easing.Cubic.Out)
          .onUpdate(() => { node.style.opacity = String(state.opacity); node.style.transform = `translateY(${state.y}px) scale(${state.scale})`; }).start();
        stop = () => tween.stop();
        const tick = (time: number) => {
          if (disposed || finished) return;
          tween.update(time);
          if (tween.isPlaying()) frame = requestAnimationFrame(tick);
          else finish();
        };
        frame = requestAnimationFrame(tick);
      }).catch(() => { if (!disposed) finish(); });
    }
    return () => { disposed = true; stop(); cancelAnimationFrame(frame); clearTimeout(timeout); preference.removeEventListener('change', changed); };
  }, [visible, layer.delay]);

  return <div ref={element} className={`portrait-layer portrait-${layer.id}${visible ? ' is-loaded' : ''}`} style={{ '--layer-x': `${layer.x}%`, '--layer-y': `${layer.y}%`, '--layer-size': `${layer.size}%`, zIndex: layer.z } as CSSProperties}>
    <img src={layer.src} srcSet={`${layer.small} ${layer.width / 2}w, ${layer.src} ${layer.width}w`} sizes={`(max-width: 700px) ${layer.size}vw, (max-width: 1296px) ${Math.round(layer.size * .56)}vw, ${Math.round(layer.size * 7)}px`} width={layer.width} height={layer.height} alt="" aria-hidden="true" loading="lazy" decoding="async" fetchPriority="low" onLoad={event => { void event.currentTarget.decode().then(() => onLoad(layer.id)).catch(onError); }} onError={onError} />
  </div>;
}

export default function HeroPortrait() {
  const scene = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState<string[]>([]);
  const coreReady = core.every(id => loaded.includes(id));
  const ready = loaded.length === layers.length;
  const markLoaded = (id: string) => setLoaded(previous => previous.includes(id) ? previous : [...previous, id]);

  useEffect(() => {
    let disposed = false, scheduled = false, idle = 0, timer = 0;
    const start = () => {
      if (scheduled) return;
      scheduled = true;
      const mount = () => { if (!disposed) setMounted(true); };
      if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(mount, { timeout: 1200 });
      else timer = window.setTimeout(mount, 100);
    };
    const visibility = () => setTabHidden(document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) start();
    }, { rootMargin: '100px' });
    if (observer && scene.current) observer.observe(scene.current); else { setInView(true); start(); }
    return () => { disposed = true; observer?.disconnect(); if (idle) window.cancelIdleCallback(idle); clearTimeout(timer); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    if (!mounted || ready || failed) return;
    const timeout = window.setTimeout(() => setFailed(true), 12000);
    return () => clearTimeout(timeout);
  }, [mounted, ready, failed]);

  return <figure className="hero-art hero-portrait">
    <div ref={scene} className={`portrait-scene${inView ? ' is-in-view' : ''}${tabHidden ? ' is-tab-hidden' : ''}${ready && !failed ? ' is-ready' : ''}${coreReady && !failed ? ' has-core' : ''}`} role="img" aria-label={coreReady && !failed ? site.hero.imageAlt : site.hero.fallbackAlt}>
      {mounted && !coreReady && !failed && <img className="portrait-loading" src={site.hero.imageSmall} width="640" height="640" alt="" loading="lazy" decoding="async" fetchPriority="low" />}
      {mounted && !failed && layers.map(layer => <PortraitLayer key={layer.id} layer={layer} visible={loaded.includes(layer.id)} onLoad={markLoaded} onError={() => setFailed(true)} />)}
      {coreReady && !failed && <svg className="coffee-steam portrait-steam" viewBox="0 0 36 60" aria-hidden="true"><path d="M9 56C-2 42 23 35 10 19S8 8 11 3"/><path d="M21 57C8 43 35 34 22 19S21 8 24 2"/><path d="M30 56C18 44 41 37 30 25"/></svg>}
      {failed && <img className="portrait-fallback" src={site.hero.image} width="960" height="960" alt="" decoding="async" loading="lazy" />}
      <noscript><img className="portrait-fallback" src={site.hero.image} width="960" height="960" alt="" loading="lazy" decoding="async" /></noscript>
    </div>
    <figcaption><span aria-hidden="true">✦</span>{site.hero.caption}</figcaption>
  </figure>;
}
