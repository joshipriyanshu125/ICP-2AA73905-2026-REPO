import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App, { getPage } from '../App.jsx';
import ContactButton from '../components/ContactButton.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { projects } from '../data/portfolio.js';

describe('portfolio pages', () => {
  it.each([['/', 'Home'], ['/projects', 'Projects'], ['/about/', 'About']])('supports direct navigation to %s', (pathname, active) => {
    render(<App pathname={pathname} />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: active }).getAttribute('aria-current')).toBe('page');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(document.title).toContain(active);
  });

  it('shows four project previews and working navigation on home', () => {
    render(<App pathname="/" />);
    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(screen.getByRole('link', { name: 'View My Work' }).getAttribute('href')).toBe('/projects');
    expect(screen.getByRole('link', { name: 'View all projects' }).getAttribute('href')).toBe('/projects');
    expect(screen.queryByText('Josh Mercer')).toBeNull();
  });

  it('shows all six previews on Projects', () => {
    render(<App pathname="/projects" />);
    expect(screen.getByRole('heading', { name: 'My recent work' })).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getAllByText('Preview')).toHaveLength(6);
  });

  it('offers a return home on an unknown route', () => {
    render(<App pathname="/not-a-page" />);
    expect(screen.getByRole('link', { name: 'Back home' }).getAttribute('href')).toBe('/');
    expect(getPage('/projects/')).toBe('projects');
  });

  it('explains unconfigured social buttons rather than using fake profile links', () => {
    render(<App pathname="/" />);
    fireEvent.click(screen.getByRole('button', { name: 'LinkedIn — details coming soon' }));
    expect(screen.getByRole('status').textContent).toContain('haven’t been added');
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).toBeNull();
  });
});

describe('theme persistence', () => {
  it('switches both ways and restores the selected theme after remount', () => {
    const view = render(<App pathname="/" />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');
    view.unmount();
    render(<App pathname="/about" />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('still works when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<App pathname="/" />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('contact controls', () => {
  it('honestly explains missing contact details and closes with Escape', () => {
    render(<ContactButton email="" />);
    fireEvent.click(screen.getByRole('button', { name: 'Show email' }));
    expect(screen.getByRole('status').textContent).toContain('once you share');
    expect(screen.queryByRole('link')).toBeNull();
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' });
    expect(screen.queryByRole('status')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button'));
  });

  it('reveals a configured email, provides mailto, then copies successfully', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<ContactButton email="hello@example.com" />);
    fireEvent.click(screen.getByRole('button', { name: 'Show email' }));
    expect(screen.getByRole('link', { name: /Open email app/ }).getAttribute('href')).toBe('mailto:hello@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Copy email address' }));
    expect(await screen.findByText('Email copied!')).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith('hello@example.com');
  });

  it('does not claim success when clipboard permission is denied', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    render(<ContactButton email="hello@example.com" />);
    fireEvent.click(screen.getByRole('button', { name: 'Show email' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy email address' }));
    expect(await screen.findByText(/Couldn’t copy/)).toBeTruthy();
    expect(screen.queryByText('Copied!')).toBeNull();
  });
});

describe('About interactions', () => {
  it('expands and collapses experience without hiding the education section', () => {
    render(<App pathname="/about" />);
    const button = screen.getByRole('button', { name: 'Show 2 more' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('An independent project')).toBeNull();
    fireEvent.click(button);
    expect(screen.getByText('An independent project')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show less' }).getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.queryByText('An independent project')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Education' })).toBeTruthy();
  });

  it('turns photo cards over with an accessible pressed state', () => {
    render(<App pathname="/about" />);
    const card = screen.getByRole('button', { name: 'Turn over photo 1' });
    expect(card.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(card);
    expect(card.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(card);
    expect(card.getAttribute('aria-pressed')).toBe('false');
  });

  it('moves tool chips with the keyboard and resets the arrangement', () => {
    render(<App pathname="/about" />);
    const chip = screen.getByRole('button', { name: 'Move React' });
    const stage = chip.parentElement;
    Object.defineProperties(stage, { clientWidth: { value: 500 }, clientHeight: { value: 220 } });
    Object.defineProperties(chip, { offsetWidth: { value: 100 }, offsetHeight: { value: 40 }, offsetLeft: { value: 100 }, offsetTop: { value: 80 } });
    const initial = chip.style.transform;
    fireEvent.keyDown(chip, { key: 'ArrowRight' });
    expect(chip.style.transform).toContain('translate3d(8px, 0px');
    fireEvent.click(screen.getByRole('button', { name: 'Reset stack' }));
    expect(chip.style.transform).toBe(initial);
    expect(screen.getByRole('status').textContent).toContain('Stack reset');
  });
});

describe('project preview boundaries', () => {
  it('replaces an unavailable image with a local fallback without a retry loop', () => {
    render(<ProjectCard project={projects[0]} />);
    const image = screen.getByRole('img');
    fireEvent.error(image);
    expect(image.getAttribute('src')).toBe('/images/placeholder.svg');
    fireEvent.error(image);
    expect(image.getAttribute('src')).toBe('/images/placeholder.svg');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('makes a configured project link accessible and safe to open in a new tab', () => {
    render(<ProjectCard project={{ ...projects[0], url: 'https://example.com/project', demo: false }} />);
    const link = screen.getByRole('link', { name: 'Project One — opens in a new tab' });
    expect(link.getAttribute('href')).toBe('https://example.com/project');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(screen.queryByText('Preview')).toBeNull();
  });
});
