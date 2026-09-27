/** Optional, idle-loaded mobile hint. No libraries, assets, or animation loop. */
export function showSwipeTutorial(grid: HTMLElement): (() => void) | null {
  if (!grid.isConnected || grid.children.length < 2 || !window.matchMedia('(max-width:700px)').matches || document.hidden) return null;
  const screen = grid.closest<HTMLElement>('.console-screen');
  if (!screen) return null;
  const style = document.createElement('style');
  style.textContent = `
    .console-screen:has(>.swipe-tutorial){position:relative}
    .swipe-tutorial{position:absolute;z-index:4;left:50%;width:220px;text-align:center;pointer-events:none;color:#f1e4cd;animation:swipe-hint-fade 1.8s both}
    .swipe-tutorial svg{display:block;width:48px;height:48px;margin:0 auto 10px;fill:#f1e4cd;stroke:#211813;stroke-width:1.5;animation:swipe-hint-hand 1.8s both}
    .swipe-tutorial span{display:inline-block;padding:9px 14px;border-radius:20px;background:#211813ed;border:1px solid #e7ad5850;font:12px/1.4 Arial,sans-serif}
    @keyframes swipe-hint-hand{0%,18%{transform:translateX(48px)}65%,100%{transform:translateX(-48px)}}
    @keyframes swipe-hint-fade{0%{opacity:0}15%,78%{opacity:1}100%{opacity:0}}
    @media(prefers-reduced-motion:reduce){.swipe-tutorial,.swipe-tutorial svg{animation:none}}
    @media(min-width:701px){.swipe-tutorial{display:none}}
  `;
  const hint = document.createElement('div');
  hint.className = 'swipe-tutorial';
  hint.setAttribute('role', 'status');
  hint.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 27V9a4 4 0 0 1 8 0v13l3-2 4 2 4 1 4 5-2 12H20L9 28a4 4 0 0 1 6-5l2 4Z"/></svg><span>Swipe left for more games ←</span>';
  const screenBounds = screen.getBoundingClientRect(), gridBounds = grid.getBoundingClientRect();
  hint.style.top = `${gridBounds.top - screenBounds.top + gridBounds.height / 2 - 38}px`;
  hint.style.marginLeft = '-110px';
  document.head.append(style); screen.append(hint);
  let timer: ReturnType<typeof setTimeout>;
  const dismiss = () => {
    clearTimeout(timer); hint.remove(); style.remove();
    grid.removeEventListener('pointerdown', dismiss); grid.removeEventListener('keydown', dismiss);
    window.removeEventListener('resize', dismiss); document.removeEventListener('visibilitychange', hidden);
  };
  const hidden = () => { if (document.hidden) dismiss(); };
  grid.addEventListener('pointerdown', dismiss, { once: true, passive: true });
  grid.addEventListener('keydown', dismiss, { once: true });
  window.addEventListener('resize', dismiss, { once: true });
  document.addEventListener('visibilitychange', hidden);
  timer = setTimeout(dismiss, 1800);
  return dismiss;
}
