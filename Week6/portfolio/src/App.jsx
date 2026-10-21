import { useEffect, useState } from 'react';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import About from './pages/About.jsx';
import Footer from './components/Footer.jsx';
import Icon from './components/Icon.jsx';
import { profile } from './data/portfolio.js';

export function getPage(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return ({ '/': 'home', '/projects': 'projects', '/about': 'about' })[path] || 'not-found';
}

export default function App({ pathname = window.location.pathname }) {
  const page = getPage(pathname);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
    try { localStorage.setItem('portfolio-theme', theme); } catch { /* Private browsing can block storage. */ }
  }, [theme]);

  useEffect(() => {
    const title = { home: 'Home', projects: 'Projects', about: 'About', 'not-found': 'Page not found' }[page];
    document.title = `${title} | ${profile.name} — Portfolio`;
  }, [page]);

  return <>
    <div className="ambient" aria-hidden="true"><div className="ambient-silk" /></div>
    <div className="site-frame" aria-hidden="true" />
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <nav className="nav-pill" aria-label="Primary">
      <ul>
        {[['home', '/', 'Home'], ['projects', '/projects', 'Projects'], ['about', '/about', 'About']].map(([key, href, label]) => <li key={key}>
          <a href={href} aria-current={page === key ? 'page' : undefined}>{label}</a>
        </li>)}
      </ul>
      <button type="button" className="theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
      </button>
    </nav>
    <main id="main-content" className={`page page-${page}`} tabIndex={-1}>
      {page === 'home' && <Home />}
      {page === 'projects' && <Projects />}
      {page === 'about' && <About />}
      {page === 'not-found' && <section className="not-found container"><p>404</p><h1>A little off the beaten path.</h1><p>That page doesn’t exist. Let’s head back to the portfolio.</p><a className="button button-primary" href="/">Back home <Icon name="arrow-right" /></a></section>}
      <Footer />
      <div className="page-bottom" aria-hidden="true" />
    </main>
  </>;
}
