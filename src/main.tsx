import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root')!;
if (root.querySelector('main')) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);

// Opt-in, localhost-only measurements. This module is never fetched by normal visitors.
if (location.hostname === '127.0.0.1' && new URLSearchParams(location.search).has('audit')) {
  void import('./audit');
}
