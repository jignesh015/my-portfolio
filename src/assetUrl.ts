/** Resolves public assets for both the Vite dev server and repository deployments. */
export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
