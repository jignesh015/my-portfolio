import { useEffect, useRef, useState, type CSSProperties } from 'react';
import games from './content/games.json';
import site from './content/site.json';

type Game = { id: string; title: string; description: string; category?: string; credit?: string; url: string; gif: string; poster: string; alt: string };
function rotation(id: string) { return (Array.from(id).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7) % 71 - 35) / 10; }

function GameCard({ game, index }: { game: Game; index: number }) {
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

  return <article ref={card} className={`game-card${playing ? ' is-playing' : ''}`} style={{ '--rotation': `${rotation(game.id)}deg` } as CSSProperties}
    onPointerEnter={event => { if (event.pointerType === 'mouse') { userStopped.current = false; startAutomatic(); } }}
    onPointerLeave={event => { if (event.pointerType === 'mouse' && !requestedByClick.current) stop(); }}
    onFocus={event => { if (!event.currentTarget.contains(event.relatedTarget)) startAutomatic(); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { stop(); userStopped.current = false; } }}
    onKeyDown={event => { if (event.key === 'Escape') { userStopped.current = true; stop(); } }}>
    <div className="card-media">
      <img className="poster" src={game.poster} alt={game.alt} loading="lazy" decoding="async" width="480" height="380" />
      {playing && !failed && <img className={`gif${loaded ? ' ready' : ''}`} src={game.gif} alt="" aria-hidden="true" width="480" height="380" decoding="async" onLoad={() => setLoaded(true)} onError={() => { setFailed(true); stop(); }} />}
      <span className="card-number" aria-label={`${site.work.indexLabel} ${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
      <button type="button" className="preview-toggle" aria-label={`${playing ? site.work.stopPreview : site.work.preview}: ${game.title}`} aria-pressed={playing} disabled={failed}
        onClick={() => { clearIntent(); if (playing) { userStopped.current = true; stop(); } else { requestedByClick.current = true; setLoaded(false); setPlaying(true); } }}>
        <span aria-hidden="true">{playing ? <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" focusable="false"><rect width="12" height="12" /></svg> : '▷'}</span><span>{playing ? site.work.stopPreview : site.work.preview}</span>
      </button>
      <span className="preview-status" role="status">{failed ? site.work.previewError : playing && !loaded ? site.work.previewLoading : ''}</span>
    </div>
    <div className="card-content">
      {game.category && <p className="card-category">{game.category}</p>}
      <h3><a href={game.url} target="_blank" rel="noopener noreferrer">{game.title}<span aria-hidden="true">↗</span></a></h3>
      <p className="card-description">{game.description}</p>
      <div className="card-bottom"><a href={game.url} target="_blank" rel="noopener noreferrer" aria-label={`${site.work.gameLink}: ${game.title}`}>{site.work.gameLink}<span aria-hidden="true">↗</span></a>{game.credit && <span>{game.credit}</span>}</div>
    </div>
  </article>;
}

export default function Gallery() {
  return <><p className="gallery-hint">{site.work.hint}</p><div className="game-grid">{games.map((game, index) => <GameCard game={game} index={index} key={game.id} />)}</div></>;
}
