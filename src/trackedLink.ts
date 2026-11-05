/** Adds campaign params so itch.io links are attributable to this portfolio. */
export function trackedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('itch.io')) return url;
    u.searchParams.set('utm_source', 'portfolio');
    u.searchParams.set('utm_medium', 'referral');
    return u.toString();
  } catch {
    return url;
  }
}

/** Sent to itch.io so the portfolio origin appears as the referrer (no `noreferrer`). */
export const linkProps = {
  target: '_blank',
  rel: 'noopener',
  referrerPolicy: 'origin' as const,
};
