import { useEffect, useRef } from 'react';
import site from './content/site.json';
import DeferredArtefacts from './DeferredArtefacts';
import { assetUrl } from './assetUrl';

export default function About() {
  const about = site.about;
  const portraitRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const portrait = portraitRef.current;
    if (!portrait) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewport = window.visualViewport;
    let disposed = false, visited = false, armed = false, playing = false, frame = 0, animationFrame = 0;
    let stop = () => {};
    const reset = () => {
      stop();
      cancelAnimationFrame(animationFrame);
      portrait.style.transform = '';
      portrait.style.willChange = '';
      playing = false;
    };
    const play = (firstVisit: boolean) => {
      if (reduced.matches) return;
      playing = true;
      void import('@tweenjs/tween.js').then(({ Tween, Easing }) => {
        if (disposed || reduced.matches) { reset(); return; }
        const state = { scale: 1 };
        const update = () => { portrait.style.transform = `scale(${state.scale})`; };
        const tweens = firstVisit
          ? [
              new Tween(state).to({ scale: 1.045 }, 260).easing(Easing.Cubic.Out),
              new Tween(state).to({ scale: 1 }, 520).easing(Easing.Back.Out),
            ]
          : [
              new Tween(state).to({ scale: .92 }, 100).easing(Easing.Quadratic.In),
              new Tween(state).to({ scale: 1.05 }, 100).easing(Easing.Back.Out),
              new Tween(state).to({ scale: .94 }, 80).easing(Easing.Quadratic.In),
              new Tween(state).to({ scale: 1 }, 420).easing(Easing.Back.Out),
            ];
        tweens.forEach((tween, index) => {
          tween.onUpdate(update);
          if (index + 1 < tweens.length) tween.chain(tweens[index + 1]);
        });
        tweens[tweens.length - 1].onComplete(() => { reset(); scheduleCheck(); });
        portrait.style.willChange = 'transform';
        tweens[0].start();
        stop = () => tweens.forEach(tween => tween.stop());
        const tick = (time: number) => {
          if (disposed) return;
          tweens.forEach(tween => tween.update(time));
          if (tweens.some(tween => tween.isPlaying())) animationFrame = requestAnimationFrame(tick);
        };
        animationFrame = requestAnimationFrame(tick);
      }).catch(reset);
    };
    const check = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const bounds = portrait.getBoundingClientRect();
      const top = viewport?.offsetTop ?? 0;
      const bottom = top + (viewport?.height ?? window.innerHeight);
      const visibleHeight = Math.max(0, Math.min(bounds.bottom, bottom) - Math.max(bounds.top, top));
      if (visited && visibleHeight < bounds.height * .45) armed = true;
      if (playing || (visited && !armed)) return;
      const firstVisit = !visited;
      if (firstVisit) {
        const centerY = bounds.top + bounds.height / 2;
        if (visibleHeight <= 0 || centerY < top + (bottom - top) * .4 || centerY > top + (bottom - top) * .6) return;
      } else if (visibleHeight < bounds.height * .45) return;
      visited = true;
      armed = false;
      play(firstVisit);
    };
    const scheduleCheck = () => { if (!frame) frame = requestAnimationFrame(check); };
    const onReducedMotionChange = () => { if (reduced.matches) reset(); };
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck);
    viewport?.addEventListener('resize', scheduleCheck);
    viewport?.addEventListener('scroll', scheduleCheck);
    document.addEventListener('visibilitychange', scheduleCheck);
    reduced.addEventListener('change', onReducedMotionChange);
    scheduleCheck();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      reset();
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
      viewport?.removeEventListener('resize', scheduleCheck);
      viewport?.removeEventListener('scroll', scheduleCheck);
      document.removeEventListener('visibilitychange', scheduleCheck);
      reduced.removeEventListener('change', onReducedMotionChange);
    };
  }, []);
  return <section id="about" className="about-section" aria-labelledby="about-title">
    <DeferredArtefacts section="about" />
    <div className="shell about-content">
      <img ref={portraitRef} className="about-portrait" src={assetUrl(about.image)} srcSet={`${assetUrl(about.imageSmall)} 280w, ${assetUrl(about.image)} 560w`} sizes="(max-width: 700px) 180px, 240px" width="280" height="280" loading="lazy" decoding="async" alt={about.imageAlt} />
      <div className="about-copy">
        <p className="eyebrow">{about.eyebrow}</p>
        <h2 id="about-title">{about.title}</h2>
        {about.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </div>
  </section>;
}
