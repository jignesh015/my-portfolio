import { useEffect, useRef, useState } from 'react';
import games from './content/games.json';
import site from './content/site.json';
import { assetUrl } from './assetUrl';
import './console-gallery.css';

type Game = { id: string; title: string; description: string; category?: string; credit?: string; url: string; gif: string; poster: string; alt: string };
type Direction = 'up' | 'down' | 'left' | 'right';
type Filter = 'all' | 'vr' | 'jam';
const directions: Direction[] = ['up', 'left', 'right', 'down'];
const arrowDirection: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

function GameCard({ game, index, selected, onSelect }: { game: Game; index: number; selected: boolean; onSelect: () => void }) {
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
    onPointerEnter={event => { if (event.pointerType === 'mouse') { onSelect(); userStopped.current = false; startAutomatic(); } }}
    onPointerLeave={event => { if (event.pointerType === 'mouse' && !requestedByClick.current) stop(); }}
    onFocus={event => { if (!event.currentTarget.contains(event.relatedTarget)) { onSelect(); startAutomatic(); } }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { stop(); userStopped.current = false; } }}
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
  const gridRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);
  const visibleGames = games.filter(game => filter === 'all' || (filter === 'vr' ? /virtual reality/i : /game jam/i).test(game.category));
  const selected = visibleGames.find(game => game.id === selectedId) ?? visibleGames[0];
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
    let leftDragging = false, lastScroll = grid.scrollTop, neutralTimer: ReturnType<typeof setTimeout> | undefined;
    const cap = left.querySelector<HTMLElement>('.console-stick-cap')!;
    const onScroll = () => {
      const delta = grid.scrollTop - lastScroll;
      lastScroll = grid.scrollTop;
      if (leftDragging || reduced.matches || !delta) return;
      cap.style.transform = `translateY(${delta > 0 ? 4 : -4}px)`;
      clearTimeout(neutralTimer);
      neutralTimer = setTimeout(() => { cap.style.transform = ''; }, 140);
    };
    grid.addEventListener('scroll', onScroll, { passive: true });
    function bindJoystick(element: HTMLButtonElement, isLeft: boolean) {
      const stickCap = element.querySelector<HTMLElement>('.console-stick-cap')!;
      let pointer: number | null = null, originX = 0, originY = 0, x = 0, y = 0, frame = 0, lastTime = 0, lastMove = 0;
      let heldDirection: Direction | null = null;
      const tick = (time: number) => {
        if (pointer === null) return;
        const dt = lastTime ? Math.min(time - lastTime, 40) : 0;
        lastTime = time;
        if (isLeft) { if (Math.abs(y) > .12) grid!.scrollTop += y * 430 * dt / 1000; }
        else {
          const direction: Direction | null = Math.max(Math.abs(x), Math.abs(y)) < .25 ? null : Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
          if (direction && (direction !== heldDirection || time - lastMove >= 260)) { navigateRef.current(direction); lastMove = time; }
          heldDirection = direction;
        }
        frame = requestAnimationFrame(tick);
      };
      const end = () => {
        if (pointer === null) return;
        const id = pointer;
        pointer = null;
        cancelAnimationFrame(frame);
        element.classList.remove('is-dragging');
        stickCap.style.transform = '';
        if (isLeft) leftDragging = false;
        if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
      };
      const down = (event: PointerEvent) => {
        if (pointer !== null || event.button !== 0) return;
        event.preventDefault();
        element.focus({ preventScroll: true });
        pointer = event.pointerId; originX = event.clientX; originY = event.clientY;
        x = y = lastTime = lastMove = 0; heldDirection = null;
        if (isLeft) { leftDragging = true; clearTimeout(neutralTimer); }
        element.setPointerCapture(pointer);
        element.classList.add('is-dragging');
        frame = requestAnimationFrame(tick);
      };
      const move = (event: PointerEvent) => {
        if (event.pointerId !== pointer) return;
        const radius = element.clientWidth * .28;
        let dx = isLeft ? 0 : event.clientX - originX, dy = event.clientY - originY;
        const distance = Math.hypot(dx, dy);
        if (distance > radius) { dx *= radius / distance; dy *= radius / distance; }
        x = dx / radius; y = dy / radius;
        stickCap.style.transform = `translate(${dx}px,${dy}px)`;
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
    const cleanLeft = bindJoystick(left, true), cleanRight = bindJoystick(right, false);
    return () => { cleanLeft(); cleanRight(); clearTimeout(neutralTimer); grid.removeEventListener('scroll', onScroll); };
  }, []);

  const joystickKeys = (event: React.KeyboardEvent, isLeft: boolean) => {
    const direction = arrowDirection[event.key];
    if (!direction) return;
    event.preventDefault();
    if (isLeft) { if (gridRef.current && (direction === 'up' || direction === 'down')) gridRef.current.scrollTop += direction === 'up' ? -65 : 65; }
    else navigateRef.current(direction);
  };
  const changeFilter = (value: Filter) => {
    setFilter(value);
    const first = games.find(game => value === 'all' || (value === 'vr' ? /virtual reality/i : /game jam/i).test(game.category));
    if (first) setSelectedId(first.id);
    if (gridRef.current) gridRef.current.scrollTop = 0;
  };
  const speaker = <div className="console-speaker" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</div>;
  return <div className="console-gallery">
    <div className="project-device">
      <div className="console-grip">
        <button type="button" className="console-utility" aria-label="Previous project" onClick={() => navigateRef.current(null, -1)}>−</button>
        <button type="button" ref={leftRef} className="console-stick" aria-label="Left joystick: drag up or down to scroll, or use arrow keys" onKeyDown={event => joystickKeys(event, true)}><span className="console-stick-cap" /></button>
        <div className="console-dpad" role="group" aria-label="Directional pad">{directions.map((direction, i) => <button type="button" key={direction} data-direction={direction} aria-label={`Highlight project ${direction}`} onClick={() => navigateRef.current(direction)}>{['▴', '◂', '▸', '▾'][i]}</button>)}</div>
        {speaker}
      </div>
      <div className="console-bezel"><section className="console-screen" aria-label="Project library">
        <div className="console-phone-top" aria-hidden="true"><span>9:41</span><span>▂▄▆ · ▰</span></div>
        <div className="library-top"><div><h3>My game library</h3><span>{visibleGames.length} projects</span></div><small>MOSTLY HARMLESS / 01</small></div>
        <div className="library-filters" aria-label="Filter projects">{(['all', 'vr', 'jam'] as const).map((value, i) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => changeFilter(value)}>{['All games', 'VR & AR', 'Game jams'][i]}</button>)}</div>
        <div className="library-grid" ref={gridRef} tabIndex={0} aria-label="Projects, scroll to browse">{visibleGames.map(game => <GameCard key={game.id} game={game} index={games.findIndex(item => item.id === game.id)} selected={game.id === selected.id} onSelect={() => setSelectedId(game.id)} />)}</div>
        <div className="library-detail"><div><div className="library-detail-heading"><h3>{selected.title}</h3>{selected.category && <span>{selected.category}</span>}</div><p>{selected.description}</p>{selected.credit && <small>{selected.credit}</small>}</div></div>
        <div className="console-home-indicator" aria-hidden="true" />
      </section></div>
      <div className="console-grip console-right">
        <button type="button" className="console-utility" aria-label="Next project" onClick={() => navigateRef.current(null, 1)}>+</button>
        <div className="console-abxy" role="group" aria-label="Project navigation">{directions.map((direction, i) => <button type="button" key={direction} aria-label={`${['Y', 'X', 'B', 'A'][i]}: highlight project ${direction}`} onClick={() => navigateRef.current(direction)}>{['Y', 'X', 'B', 'A'][i]}</button>)}</div>
        <button type="button" ref={rightRef} className="console-stick" aria-label="Right joystick: drag to highlight a project, or use arrow keys" onKeyDown={event => joystickKeys(event, false)}><span className="console-stick-cap" /></button>
        {speaker}
      </div>
    </div>
    <p className="console-hint"><span>Scroll the screen or use the sticks to explore. </span>Hover a game for a little gameplay.</p>
  </div>;
}
