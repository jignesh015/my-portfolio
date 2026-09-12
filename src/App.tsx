import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
      <nav ref={navRef} aria-label={site.navigationLabel}>{site.navigation.map(link => <a key={link.href} href={link.href} aria-current={activeHref === link.href ? 'page' : undefined}>{link.label}</a>)}</nav>
    </div></header></div>
    <main id="main">
      <section className="hero shell" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span />{site.hero.eyebrow}</p>
          <h1 id="hero-title"><span>{site.hero.greeting}</span>{site.hero.headline}</h1>
          <p className="hero-summary">{site.hero.summary}</p>
          <a className="button" href="#work">{site.hero.cta}<span aria-hidden="true">↗</span></a>
          <p className="hero-note">{site.hero.note}</p>
        </div>
        <HeroPortrait />
      </section>
      <section className="work-section" id="work" aria-labelledby="work-title"><DeferredArtefacts section="work" /><div className="shell"><div className="section-heading"><p className="eyebrow">{site.work.eyebrow}</p><h2 id="work-title">{site.work.title}</h2><p>{site.work.description}</p></div><Gallery /></div></section>
      <About />
    </main>
    <footer id="contact" className="contact"><HangingLights /><div className="shell"><p className="eyebrow">{site.footer.eyebrow}</p><h2>{site.footer.title}</h2><p className="contact-copy">{site.footer.description}</p><Socials /><div className="footer-bottom"><p>© {new Date().getFullYear()} {site.footer.copyright}</p><p className="signoff">{site.footer.signoff}</p><a href="#home" aria-label={site.footer.backToTop}>↑</a></div></div></footer>
  </>;
}

