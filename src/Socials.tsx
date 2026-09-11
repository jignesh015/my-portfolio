import socials from './content/socials.json';

function SocialIcon({ icon }: { icon: string }) {
  if (icon === 'linkedin') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.5 9h3v12h-3ZM9 9h3v1.6c.7-1.2 1.7-1.9 3.3-1.9 3.4 0 4.2 2.2 4.2 5.3v7h-3v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V21H9Z"/></svg>;
  if (icon === 'github') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.56 9.56 0 0 1 12 6.82c.85 0 1.71.12 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.58 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 3-2 5c0 2 3 3 4 1 1 2 4 2 6 0 2 2 5 2 6 0 1 2 4 1 4-1l-2-5ZM4 11v9h16v-9"/><path d="M8 15h8l1 4-3-1h-4l-3 1ZM9 14v3m-1.5-1.5h3m4 0h.01"/></svg>;
}

export default function Socials() {
  return <div className="socials">{socials.map(social => <a href={social.url} key={social.icon} target="_blank" rel="noopener noreferrer" aria-label={social.label}><span className="social-icon"><SocialIcon icon={social.icon} /></span><span>{social.label}</span></a>)}</div>;
}
