import site from './content/site.json';
import DeferredArtefacts from './DeferredArtefacts';
import { assetUrl } from './assetUrl';

export default function About() {
  const about = site.about;
  return <section id="about" className="about-section" aria-labelledby="about-title">
    <DeferredArtefacts section="about" />
    <div className="shell about-content">
      <img className="about-portrait" src={assetUrl(about.image)} srcSet={`${assetUrl(about.imageSmall)} 280w, ${assetUrl(about.image)} 560w`} sizes="(max-width: 700px) 180px, 240px" width="280" height="280" loading="lazy" decoding="async" alt={about.imageAlt} />
      <div className="about-copy">
        <p className="eyebrow">{about.eyebrow}</p>
        <h2 id="about-title">{about.title}</h2>
        {about.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </div>
  </section>;
}
