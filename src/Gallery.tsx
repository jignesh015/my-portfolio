import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import games from './content/games.json';
import site from './content/site.json';
import { assetUrl } from './assetUrl';
import './console-gallery.css';

type Game = { id: string; title: string; description: string; category?: string; credit?: string; url: string; gif: string; poster: string; alt: string };
type Direction = 'up' | 'down' | 'left' | 'right';
type Filter = 'all' | 'vr' | 'jam';
const directions: Direction[] = ['up', 'left', 'right', 'down'];
const arrowDirection: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
const swipeTutorialKey = 'mostly-harmless:swipe-tutorial-seen';

function GameCard({ game, index, selected, onSelect, onHoverStart, onHoverEnd }: { game: Game; index: number; selected: boolean; onSelect: () => void; onHoverStart: () => void; onHoverEnd: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const card = useRef<HTMLElement>(null);
  const userStopped = useRef(false);
  const requestedByClick = useRef(false);
  const intentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearIntent = () => { if (intentTimer.current) clearTimeout(intentTimer.current); intentTimer.current = null; };
  const stop = () => { clearIntent(); setPlaying(false); requestedByClick.current = false; };
  const startAutomatic = () => {
    if (playing || userStopped.current || failed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearIntent();
    intentTimer.current = setTimeout(() => { setPlaying(true); setLoaded(false); }, 160);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); });
    if (card.current) observer.observe(card.current);
    const onHidden = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', onHidden);
    return () => { observer.disconnect(); clearIntent(); document.removeEventListener('visibilitychange', onHidden); };
  }, []);

  return <article ref={card} data-game-id={game.id} className={`library-card${selected ? ' is-selected' : ''}${playing ? ' is-playing' : ''}`}
    onPointerEnter={event => { if (event.pointerType === 'mouse') { onSelect(); onHoverStart(); userStopped.current = false; startAutomatic(); } }}
    onPointerLeave={event => { if (event.pointerType === 'mouse') { onHoverEnd(); if (!requestedByClick.current) stop(); } }}
    onFocus={event => { if (!event.currentTarget.contains(event.relatedTarget)) { onSelect(); onHoverStart(); startAutomatic(); } }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { onHoverEnd(); stop(); userStopped.current = false; } }}
    onKeyDown={event => { if (event.key === 'Escape') { userStopped.current = true; stop(); } }}>
    <div className="card-media">
      <a className="library-select" href={game.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${game.title} in a new tab`} onClick={onSelect}>
      <img className="poster" src={assetUrl(game.poster)} alt={game.alt} loading="lazy" decoding="async" width="480" height="380" />
      {playing && !failed && <img className={`gif${loaded ? ' ready' : ''}`} src={assetUrl(game.gif)} alt="" aria-hidden="true" width="480" height="380" decoding="async" onLoad={() => setLoaded(true)} onError={() => { setFailed(true); stop(); }} />}
      </a>
      <span className="card-number" aria-label={`${site.work.indexLabel} ${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
      <button type="button" className="preview-toggle" aria-label={`${playing ? site.work.stopPreview : site.work.preview}: ${game.title}`} aria-pressed={playing} disabled={failed}
        onClick={() => { clearIntent(); if (playing) { userStopped.current = true; stop(); } else { requestedByClick.current = true; setLoaded(false); setPlaying(true); } }}>
        <span aria-hidden="true">{playing ? <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" focusable="false"><rect width="12" height="12" /></svg> : '▷'}</span><span>{playing ? site.work.stopPreview : site.work.preview}</span>
      </button>
      {failed && <span className="preview-status" role="status">{site.work.previewError}</span>}
    </div>
    <h3 className="library-game-title"><a href={game.url} target="_blank" rel="noopener noreferrer">{game.title}<span aria-hidden="true"> ↗</span></a></h3>
    <p className="library-sr-only">{game.description}{game.credit ? ` — ${game.credit}` : ''}</p>
  </article>;
}

export default function Gallery() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState(games[0].id);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTwitchPhase, setPopupTwitchPhase] = useState(0);
  const [popupLayoutVersion, setPopupLayoutVersion] = useState(0);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({ left: 0, top: 0, opacity: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const popupCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPopupPlacement = useRef<{ left: number; top: number; selectedId: string; visible: boolean } | null>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);
  const visibleGames = games.filter(game => filter === 'all' || (filter === 'vr' ? /virtual reality/i : /game jam/i).test(game.category));
  const selected = visibleGames.find(game => game.id === selectedId) ?? visibleGames[0];
  const showPopup = () => { if (popupCloseTimer.current) clearTimeout(popupCloseTimer.current); popupCloseTimer.current = null; setPopupOpen(true); };
  const hidePopupSoon = () => { if (popupCloseTimer.current) clearTimeout(popupCloseTimer.current); popupCloseTimer.current = setTimeout(() => setPopupOpen(false), 110); };
  const moveConsoleCursor = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(pointer:fine)').matches || !cursorRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    cursorRef.current.style.left = `${event.clientX - bounds.left}px`;
    cursorRef.current.style.top = `${event.clientY - bounds.top}px`;
  };
  useLayoutEffect(() => {
    const screen = deviceRef.current?.querySelector<HTMLElement>('.console-screen');
    const popup = screen?.querySelector<HTMLElement>('.library-description-popup');
    const card = gridRef.current?.querySelector<HTMLElement>(`[data-game-id="${selected.id}"]`);
    if (!screen || !popup || !card || mobileLayout) return;
    const screenRect = screen.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const rightSpace = screenRect.right - cardRect.right - 8;
    const leftSpace = cardRect.left - screenRect.left - 8;
    const placeRight = rightSpace >= leftSpace;
    const available = Math.max(0, (placeRight ? rightSpace : leftSpace) - 12);
    const width = Math.min(232, available);
    popup.style.width = `${width}px`;
    const popupHeight = popup.offsetHeight;
    const x = placeRight ? cardRect.right - screenRect.left + 8 : cardRect.left - screenRect.left - width - 8;
    const y = Math.max(8, Math.min(cardRect.top - screenRect.top + cardRect.height / 2 - popupHeight / 2, screenRect.height - popupHeight - 8));
    const left = Math.max(8, Math.min(x, screenRect.width - width - 8));
    const previous = lastPopupPlacement.current;
    if (popupOpen && previous?.visible && previous.selectedId !== selected.id && (Math.abs(previous.left - left) > .5 || Math.abs(previous.top - y) > .5)) setPopupTwitchPhase(phase => phase + 1);
    lastPopupPlacement.current = { left, top: y, selectedId: selected.id, visible: popupOpen };
    setPopupStyle({ left, top: y, width, opacity: popupOpen ? 1 : 0, transform: popupOpen ? 'translateY(0) scale(1)' : 'translateY(5px) scale(.98)' });
  }, [selected.id, selected.description, selected.credit, selected.category, popupOpen, mobileLayout, popupLayoutVersion]);
  useEffect(() => {
    if (!popupOpen || mobileLayout) return;
    const reposition = () => setPopupLayoutVersion(version => version + 1);
    window.addEventListener('resize', reposition);
    const grid = gridRef.current;
    grid?.addEventListener('scroll', reposition, { passive: true });
    return () => { window.removeEventListener('resize', reposition); grid?.removeEventListener('scroll', reposition); };
  }, [popupOpen, mobileLayout]);
  useEffect(() => {
    const device = deviceRef.current;
    if (!device) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewport = window.visualViewport;
    let disposed = false, visited = false, armed = false, playing = false, frame = 0, animationFrame = 0;
    let stop = () => {};
    const reset = () => {
      stop(); cancelAnimationFrame(animationFrame);
      device.style.transform = '';
      device.style.willChange = '';
      playing = false;
    };
    const play = (firstVisit: boolean) => {
      if (reduced.matches) return;
      playing = true;
      void import('@tweenjs/tween.js').then(({ Tween, Easing }) => {
        if (disposed || reduced.matches) { reset(); return; }
        const state = { scale: 1 };
        const update = () => { device.style.transform = `scale(${state.scale})`; };
        const tweens = firstVisit
          ? [
              new Tween(state).to({ scale: 1.045 }, 260).easing(Easing.Cubic.Out),
              new Tween(state).to({ scale: 1 }, 520).easing(Easing.Back.Out),
            ]
          : [
              new Tween(state).to({ scale: .965 }, 100).easing(Easing.Quadratic.In),
              new Tween(state).to({ scale: 1.012 }, 100).easing(Easing.Back.Out),
              new Tween(state).to({ scale: .98 }, 80).easing(Easing.Quadratic.In),
              new Tween(state).to({ scale: 1 }, 420).easing(Easing.Back.Out),
            ];
        tweens.forEach((tween, index) => {
          tween.onUpdate(update);
          if (index + 1 < tweens.length) tween.chain(tweens[index + 1]);
        });
        tweens[tweens.length - 1].onComplete(() => { reset(); scheduleCheck(); });
        device.style.willChange = 'transform';
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
      const bounds = device.getBoundingClientRect();
      const visibleTop = Math.max(viewport?.offsetTop ?? 0, document.querySelector('.header-bar')?.getBoundingClientRect().bottom ?? 0);
      const visibleBottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight);
      const visibleRight = (viewport?.offsetLeft ?? 0) + (viewport?.width ?? window.innerWidth);
      const visibleHeight = Math.max(0, Math.min(bounds.bottom, visibleBottom) - Math.max(bounds.top, visibleTop));
      if (visited && visibleHeight < bounds.height * .45) armed = true;
      const fullyVisible = bounds.top >= visibleTop && bounds.bottom <= visibleBottom && bounds.left >= (viewport?.offsetLeft ?? 0) && bounds.right <= visibleRight;
      if (!fullyVisible || playing || (visited && !armed)) return;
      const firstVisit = !visited;
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
  useEffect(() => {
    const mobile = window.matchMedia('(max-width:700px)');
    const update = () => { setMobileLayout(mobile.matches); setDetailExpanded(false); };
    update();
    mobile.addEventListener('change', update);
    return () => mobile.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!detailExpanded) return;
    const dismissOutside = (event: Event) => {
      if (event.target instanceof Node && !detailRef.current?.contains(event.target)) setDetailExpanded(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setDetailExpanded(false); };
    document.addEventListener('pointerdown', dismissOutside, true);
    document.addEventListener('focusin', dismissOutside);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true);
      document.removeEventListener('focusin', dismissOutside);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [detailExpanded]);
  const navigateRef = useRef<(direction: Direction | null, step?: number) => void>(() => {});
  navigateRef.current = (direction, step = 0) => {
    const grid = gridRef.current;
    if (!grid) return;
    const current = visibleGames.findIndex(game => game.id === selected.id);
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    let next = current;
    if (step) next = Math.max(0, Math.min(visibleGames.length - 1, current + step));
    else if (direction === 'left' && current % columns > 0) next--;
    else if (direction === 'right' && current % columns < columns - 1 && current + 1 < visibleGames.length) next++;
    else if (direction === 'up' && current >= columns) next -= columns;
    else if (direction === 'down') {
      const nextRowStart = (Math.floor(current / columns) + 1) * columns;
      if (nextRowStart < visibleGames.length) next = Math.min(current + columns, visibleGames.length - 1);
    }
    if (next === current) return;
    setSelectedId(visibleGames[next].id);
    const item = grid.querySelector<HTMLElement>(`[data-game-id="${visibleGames[next].id}"]`);
    if (item) {
      const top = item.offsetTop, bottom = top + item.offsetHeight;
      if (top < grid.scrollTop) grid.scrollTop = top;
      else if (bottom > grid.scrollTop + grid.clientHeight) grid.scrollTop = bottom - grid.clientHeight;
    }
  };

  useEffect(() => {
    const grid = gridRef.current, left = leftRef.current, right = rightRef.current;
    if (!grid || !left || !right) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stickDragging = false, lastScroll = grid.scrollTop, neutralTimer: ReturnType<typeof setTimeout> | undefined;
    const cap = left.querySelector<HTMLElement>('.console-stick-cap')!;
    const onScroll = () => {
      const delta = grid.scrollTop - lastScroll;
      lastScroll = grid.scrollTop;
      if (stickDragging || reduced.matches || !delta) return;
      cap.style.transform = `translateY(${delta > 0 ? 4 : -4}px)`;
      clearTimeout(neutralTimer);
      neutralTimer = setTimeout(() => { cap.style.transform = ''; }, 140);
    };
    grid.addEventListener('scroll', onScroll, { passive: true });
    function bindJoystick(element: HTMLButtonElement) {
      const stickCap = element.querySelector<HTMLElement>('.console-stick-cap')!;
      let pointer: number | null = null, originY = 0, y = 0, frame = 0, lastTime = 0;
      const tick = (time: number) => {
        if (pointer === null) return;
        const dt = lastTime ? Math.min(time - lastTime, 40) : 0;
        lastTime = time;
        if (Math.abs(y) > .12) grid!.scrollTop += y * 430 * dt / 1000;
        frame = requestAnimationFrame(tick);
      };
      const end = () => {
        if (pointer === null) return;
        const id = pointer;
        pointer = null;
        cancelAnimationFrame(frame);
        element.classList.remove('is-dragging');
        stickCap.style.transform = '';
        stickDragging = false;
        if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
      };
      const down = (event: PointerEvent) => {
        if (pointer !== null || event.button !== 0) return;
        event.preventDefault();
        element.focus({ preventScroll: true });
        pointer = event.pointerId; originY = event.clientY;
        y = lastTime = 0;
        stickDragging = true; clearTimeout(neutralTimer);
        element.setPointerCapture(pointer);
        element.classList.add('is-dragging');
        frame = requestAnimationFrame(tick);
      };
      const move = (event: PointerEvent) => {
        if (event.pointerId !== pointer) return;
        const radius = element.clientHeight * .28;
        let dy = event.clientY - originY;
        dy = Math.max(-radius, Math.min(radius, dy));
        y = dy / radius;
        stickCap.style.transform = `translateY(${dy}px)`;
      };
      const hidden = () => { if (document.hidden) end(); };
      element.addEventListener('pointerdown', down);
      element.addEventListener('pointermove', move);
      const endings = ['pointerup', 'pointercancel', 'lostpointercapture'] as const;
      endings.forEach(type => element.addEventListener(type, end));
      window.addEventListener('blur', end); window.addEventListener('resize', end);
      document.addEventListener('visibilitychange', hidden);
      return () => {
        end(); element.removeEventListener('pointerdown', down); element.removeEventListener('pointermove', move);
        endings.forEach(type => element.removeEventListener(type, end));
        window.removeEventListener('blur', end); window.removeEventListener('resize', end);
        document.removeEventListener('visibilitychange', hidden);
      };
    }
    const cleanLeft = bindJoystick(left), cleanRight = bindJoystick(right);
    return () => { cleanLeft(); cleanRight(); clearTimeout(neutralTimer); grid.removeEventListener('scroll', onScroll); };
  }, []);

  const joystickKeys = (event: React.KeyboardEvent) => {
    const direction = arrowDirection[event.key];
    if (!direction) return;
    event.preventDefault();
    if (gridRef.current && (direction === 'up' || direction === 'down')) gridRef.current.scrollTop += direction === 'up' ? -65 : 65;
  };
  const changeFilter = (value: Filter) => {
    setFilter(value);
    const first = games.find(game => value === 'all' || (value === 'vr' ? /virtual reality/i : /game jam/i).test(game.category));
    if (first) setSelectedId(first.id);
    if (gridRef.current) gridRef.current.scrollTop = 0;
  };
  const cycleFilter = (step: -1 | 1) => {
    const filters: Filter[] = ['all', 'vr', 'jam'];
    const current = filters.indexOf(filter);
    changeFilter(filters[(current + step + filters.length) % filters.length]);
  };
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const mobile = window.matchMedia('(max-width:700px)');
    let frame = 0;
    const selectVisibleCard = () => {
      frame = 0;
      if (!mobile.matches) return;
      const center = grid.getBoundingClientRect().left + grid.clientWidth / 2;
      let nearest: HTMLElement | null = null, distance = Infinity;
      grid.querySelectorAll<HTMLElement>('[data-game-id]').forEach(card => {
        const bounds = card.getBoundingClientRect();
        const offset = Math.abs(bounds.left + bounds.width / 2 - center);
        if (offset < distance) { nearest = card; distance = offset; }
      });
      const id = (nearest as HTMLElement | null)?.dataset.gameId;
      if (id) setSelectedId(id);
    };
    const onScroll = () => { if (mobile.matches && !frame) frame = requestAnimationFrame(selectVisibleCard); };
    const resetMobile = () => {
      if (!mobile.matches) return;
      grid.scrollLeft = 0;
      selectVisibleCard();
    };
    resetMobile();
    grid.addEventListener('scroll', onScroll, { passive: true });
    mobile.addEventListener('change', resetMobile);
    return () => { cancelAnimationFrame(frame); grid.removeEventListener('scroll', onScroll); mobile.removeEventListener('change', resetMobile); };
  }, [filter]);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !('IntersectionObserver' in window)) return;
    const mobile = window.matchMedia('(max-width:700px)');
    let disposed = false, visible = false, shown = false, loading = false;
    let idle = 0, timer: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined, dismiss: (() => void) | undefined;
    const hasSeen = () => {
      try { return sessionStorage.getItem(swipeTutorialKey) === '1'; } catch { return false; }
    };
    const cancelIdle = () => {
      if (idle) window.cancelIdleCallback(idle);
      idle = 0; clearTimeout(timer);
    };
    const whenIdle = (action: () => void) => {
      cancelIdle();
      // No deadline: the tutorial must never compete with page loading or input.
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => { idle = 0; action(); });
      else timer = setTimeout(action, 600);
    };
    const loadTutorial = () => {
      if (disposed || shown || loading || !visible || !mobile.matches || hasSeen()) return;
      loading = true;
      void import('./swipe-tutorial').then(({ showSwipeTutorial }) => {
        if (disposed || !visible || !mobile.matches || hasSeen()) return;
        const cleanup = showSwipeTutorial(grid);
        if (!cleanup) return;
        dismiss = cleanup; shown = true;
        try { sessionStorage.setItem(swipeTutorialKey, '1'); } catch { /* In-memory once-only guard still applies. */ }
        observer?.disconnect();
      }).catch(() => { /* An optional hint must never affect the library. */ }).finally(() => { loading = false; });
    };
    const observe = () => {
      observer?.disconnect(); cancelIdle();
      if (disposed || shown || hasSeen() || !mobile.matches || document.readyState !== 'complete') return;
      whenIdle(() => {
        if (disposed || !mobile.matches) return;
        observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting && entry.intersectionRatio >= .6;
          if (visible) whenIdle(loadTutorial); else cancelIdle();
        }, { threshold: .6, rootMargin: '-60px 0px 0px 0px' });
        observer.observe(grid);
      });
    };
    observe();
    window.addEventListener('load', observe, { once: true });
    mobile.addEventListener('change', observe);
    return () => { disposed = true; cancelIdle(); observer?.disconnect(); dismiss?.(); window.removeEventListener('load', observe); mobile.removeEventListener('change', observe); };
  }, []);
  const speaker = <div className="console-speaker" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</div>;
  return <div className="console-gallery">
    <div ref={deviceRef} className="project-device">
      <button type="button" className="console-shoulder console-shoulder-left" aria-label="Previous library filter" onClick={() => cycleFilter(-1)}>L</button>
      <button type="button" className="console-shoulder console-shoulder-right" aria-label="Next library filter" onClick={() => cycleFilter(1)}>R</button>
      <div className="console-grip">
        <button type="button" className="console-utility" aria-label="Previous project" onClick={() => navigateRef.current(null, -1)}>−</button>
        <button type="button" ref={leftRef} className="console-stick" aria-label="Left joystick: drag up or down to scroll, or use arrow keys" onKeyDown={joystickKeys}><span className="console-stick-cap" /></button>
        <div className="console-dpad" role="group" aria-label="Directional pad">{directions.map((direction, i) => <button type="button" key={direction} data-direction={direction} aria-label={`Highlight project ${direction}`} onClick={() => navigateRef.current(direction)}>{['▴', '◂', '▸', '▾'][i]}</button>)}</div>
        {speaker}
      </div>
      <div className="console-bezel"><section className={`console-screen${cursorVisible ? ' has-custom-cursor' : ''}`} aria-label="Project library"
        onPointerEnter={event => { if (event.pointerType === 'mouse' && window.matchMedia('(pointer:fine)').matches) setCursorVisible(true); moveConsoleCursor(event); }}
        onPointerMove={moveConsoleCursor}
        onPointerLeave={event => { if (event.pointerType === 'mouse') { setCursorVisible(false); if (cursorRef.current) { cursorRef.current.style.left = '-100px'; cursorRef.current.style.top = '-100px'; } } }}>
        <div className="console-phone-top" aria-hidden="true" />
        <div className="library-top"><div><h3>My game library</h3><span>{visibleGames.length} projects</span></div><div className="library-filters" aria-label="Filter projects">{(['all', 'vr', 'jam'] as const).map((value, i) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => changeFilter(value)}>{['All games', 'VR & AR', 'Game jams'][i]}</button>)}</div></div>
        <div className="library-grid" ref={gridRef} tabIndex={0} aria-label="Projects, scroll to browse">{visibleGames.map(game => <GameCard key={game.id} game={game} index={games.findIndex(item => item.id === game.id)} selected={game.id === selected.id} onSelect={() => setSelectedId(game.id)} onHoverStart={showPopup} onHoverEnd={hidePopupSoon} />)}</div>
        {!mobileLayout && <div className={`library-description-popup${popupOpen ? ' is-visible' : ''}${popupTwitchPhase ? ` twitch-${popupTwitchPhase % 2 ? 'a' : 'b'}` : ''}`} style={popupStyle} aria-hidden="true">
          <div className="library-description-popup-heading"><strong>{selected.title}</strong>{selected.category && <span>{selected.category}</span>}</div>
          <p>{selected.description}</p>{selected.credit && <small>{selected.credit}</small>}
        </div>}
        <span ref={cursorRef} className="console-custom-cursor" aria-hidden="true"><i /></span>
        <div className="library-pagination" role="group" aria-label={site.work.indexLabel}>
          {visibleGames.map((game, index) => <button type="button" key={game.id} aria-label={`${game.title}, ${index + 1} / ${visibleGames.length}`} aria-current={game.id === selected.id ? 'true' : undefined}
            onClick={() => {
              const grid = gridRef.current;
              const card = grid?.querySelector<HTMLElement>(`[data-game-id="${game.id}"]`);
              if (!grid || !card) return;
              const bounds = card.getBoundingClientRect();
              grid.scrollTo({ left: grid.scrollLeft + bounds.left + bounds.width / 2 - grid.getBoundingClientRect().left - grid.clientWidth / 2, behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
            }}><span aria-hidden="true" /></button>)}
        </div>
        {mobileLayout && <div className="library-detail-slot"><div ref={detailRef} className={`library-detail${detailExpanded ? ' is-expanded' : ''}`}
          role={mobileLayout ? 'region' : undefined} aria-labelledby={mobileLayout ? 'library-detail-title' : undefined}
          onClick={() => { if (mobileLayout) setDetailExpanded(true); }}>
          {mobileLayout && <button type="button" className="library-detail-handle" aria-label={detailExpanded ? site.work.collapseDescription : site.work.expandDescription} aria-expanded={detailExpanded}
            onClick={event => { event.stopPropagation(); setDetailExpanded(value => !value); }}><span aria-hidden="true" /></button>}
          <div><div className="library-detail-heading"><h3 id="library-detail-title">{selected.title}</h3>{selected.category && <span>{selected.category}</span>}</div><p>{selected.description}</p>{selected.credit && <small>{selected.credit}</small>}</div>
          {mobileLayout && detailExpanded && <a href={selected.url} target="_blank" rel="noopener noreferrer">{site.work.gameLink}<span aria-hidden="true"> ↗</span></a>}
        </div></div>}
        <div className="console-home-indicator" aria-hidden="true" />
      </section></div>
      <div className="console-grip console-right">
        <button type="button" className="console-utility" aria-label="Next project" onClick={() => navigateRef.current(null, 1)}>+</button>
        <div className="console-abxy" role="group" aria-label="Project navigation">{directions.map((direction, i) => <button type="button" key={direction} aria-label={`${['Y', 'X', 'B', 'A'][i]}: highlight project ${direction}`} onClick={() => navigateRef.current(direction)}>{['Y', 'X', 'B', 'A'][i]}</button>)}</div>
        <button type="button" ref={rightRef} className="console-stick" aria-label="Right joystick: drag up or down to scroll, or use arrow keys" onKeyDown={joystickKeys}><span className="console-stick-cap" /></button>
        {speaker}
      </div>
    </div>
    <p className="console-hint"><span className="console-hint-desktop">Scroll the screen or use the sticks to explore. Hover a game for a little gameplay.</span><span className="console-hint-mobile">Swipe to browse. Tap a game to open it, or ▷ for a preview.</span></p>
  </div>;
}
