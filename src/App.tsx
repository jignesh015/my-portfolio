import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import site from './content/site.json';
import Gallery from './Gallery';
import Socials from './Socials';
import HeroPortrait from './HeroPortrait';
import About from './About';
import DeferredArtefacts from './DeferredArtefacts';
import HangingLights from './HangingLights';
import { assetUrl } from './assetUrl';

export default function App() {
  const [compact, setCompact] = useState(false);
  const [activeHref, setActiveHref] = useState('#home');
  const navRef = useRef<HTMLElement>(null);
  const showWork = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const mobile = window.matchMedia('(max-width:700px)').matches;
    const gallery = document.querySelector<HTMLElement>(mobile ? '#work .project-device' : '#work .console-gallery');
    if (!gallery) return;
    event.preventDefault();
    const bounds = gallery.getBoundingClientRect();
    const headerHeight = mobile ? 60 : 68;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const inset = headerHeight + Math.max(16, (viewportHeight - headerHeight - bounds.height) / 2);
    window.scrollTo({ top: window.scrollY + bounds.top - inset, behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
    if (window.location.hash !== '#work') window.history.pushState(null, '', '#work');
    setActiveHref('#work');
  };

  useEffect(() => {
    let frame = 0;
    const updateNavigation = () => {
      frame = 0;
      setCompact(window.scrollY > 32);
      const currentPosition = window.scrollY + 130;
      const activeSection = [...site.navigation].reverse().find(({ href }) => {
        const section = document.querySelector<HTMLElement>(href);
        return section ? section.offsetTop <= currentPosition : false;
      });
      if (activeSection) setActiveHref(activeSection.href);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateNavigation);
    };

    updateNavigation();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', updateNavigation);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', updateNavigation);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const nav = navRef.current;
      const activeLink = nav?.querySelector<HTMLAnchorElement>(`a[href="${activeHref}"]`);
      if (!nav || !activeLink || activeLink.offsetParent === null) {
        nav?.style.setProperty('--indicator-width', '0px');
        return;
      }
      const navBounds = nav.getBoundingClientRect();
      const linkBounds = activeLink.getBoundingClientRect();
      nav.style.setProperty('--indicator-x', `${linkBounds.left - navBounds.left}px`);
      nav.style.setProperty('--indicator-width', `${linkBounds.width}px`);
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeHref, compact]);
  return <>
    <a className="skip-link" href="#main">{site.skipLink}</a>
    <div className="header-space"><header className={`header-bar${compact ? ' is-compact' : ''}`}><div className="site-header shell">
      <a className="brand" href="#home"><img className="brand-icon" src={assetUrl('favicon.svg')} width="52" height="44" alt="" /><span>{site.name}<small>{site.role}</small></span></a>
      <nav ref={navRef} aria-label={site.navigationLabel}>{site.navigation.map(link => <a key={link.href} href={link.href} onClick={link.href === '#work' ? showWork : undefined} aria-current={activeHref === link.href ? 'page' : undefined}>{link.label}</a>)}</nav>
    </div></header></div>
    <main id="main">
      <section className="hero shell" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title"><span>{site.hero.greeting}</span>{site.hero.headline}</h1>
          <p className="hero-summary">{site.hero.summary}</p>
          <a className="button" href="#work" onClick={showWork}>{site.hero.cta}<span aria-hidden="true">↓</span></a>
          <p className="hero-note">{site.hero.note}</p>
        </div>
        <HeroPortrait />
      </section>
      <section className="work-section" id="work" aria-label="My work"><DeferredArtefacts section="work" /><div className="shell"><Gallery /></div></section>
      <About />
    </main>
    <footer id="contact" className="contact"><HangingLights /><div className="shell"><p className="eyebrow">{site.footer.eyebrow}</p><h2>{site.footer.title}</h2><p className="contact-copy">{site.footer.description}</p><Socials /><div className="footer-bottom"><p>© {new Date().getFullYear()} {site.footer.copyright}</p><p className="signoff">{site.footer.signoff}</p><a href="#home" aria-label={site.footer.backToTop}>↑</a></div></div></footer>
  </>;
}

