import site from './content/site.json';
import Gallery from './Gallery';
import Socials from './Socials';

export function Cup({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M6 12h17v9a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7Zm17 2h2a4 4 0 0 1 0 8h-2M11 7l1-4m6 4 1-4M4 28h23"/></svg>;
}

export default function App() {
  return <>
    <a className="skip-link" href="#main">{site.skipLink}</a>
    <header className="site-header shell">
      <a className="brand" href="#home"><Cup /><span>{site.name}<small>{site.role}</small></span></a>
      <nav aria-label={site.navigationLabel}>{site.navigation.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
    </header>
    <main id="main">
      <section className="hero shell" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span />{site.hero.eyebrow}</p>
          <h1 id="hero-title"><span>{site.hero.greeting}</span>{site.hero.headline}</h1>
          <p className="hero-summary">{site.hero.summary}</p>
          <a className="button" href="#work">{site.hero.cta}<span aria-hidden="true">↗</span></a>
          <p className="hero-note">{site.hero.note}</p>
        </div>
        <figure className="hero-art">
          <img src={site.hero.image} srcSet={`${site.hero.imageSmall} 640w, ${site.hero.image} 960w`} sizes="(max-width: 700px) 100vw, (max-width: 1296px) 56vw, 715px" width="960" height="960" fetchPriority="high" alt={site.hero.imageAlt} />
          <svg className="coffee-steam" viewBox="0 0 36 60" aria-hidden="true"><path d="M9 56C-2 42 23 35 10 19S8 8 11 3"/><path d="M21 57C8 43 35 34 22 19S21 8 24 2"/><path d="M30 56C18 44 41 37 30 25"/></svg>
          <figcaption><span aria-hidden="true">✦</span>{site.hero.caption}</figcaption>
        </figure>
      </section>
      <section className="work-section" id="work" aria-labelledby="work-title"><div className="desk-ring" aria-hidden="true"/><div className="shell"><div className="section-heading"><p className="eyebrow">{site.work.eyebrow}</p><h2 id="work-title">{site.work.title}</h2><p>{site.work.description}</p></div><Gallery /></div></section>
    </main>
    <footer id="contact" className="contact"><div className="hanging-lights" aria-hidden="true"><i/><i/><i/><i/></div><div className="shell"><p className="eyebrow">{site.footer.eyebrow}</p><h2>{site.footer.title}</h2><p className="contact-copy">{site.footer.description}</p><Socials /><div className="footer-bottom"><p>© {new Date().getFullYear()} {site.footer.copyright}</p><p className="signoff">{site.footer.signoff}</p><a href="#home" aria-label={site.footer.backToTop}>↑</a></div></div></footer>
  </>;
}
