import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App, { getPage } from '../App.jsx';
import ContactButton from '../components/ContactButton.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { about, profile, projects } from '../data/portfolio.js';

describe('portfolio pages', () => {
  it.each([['/', 'Home'], ['/projects', 'Projects'], ['/about/', 'About']])('supports direct navigation to %s', (pathname, active) => {
    render(<App pathname={pathname} />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: active }).getAttribute('aria-current')).toBe('page');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(document.title).toContain(active);
  });

  it('shows the three six-week projects and working navigation on home', () => {
    render(<App pathname="/" />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByText(/I’m Priyanshu/)).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Priyanshu Joshi initials' }).getAttribute('src')).toBe('/images/priyanshu-monogram.svg');
    expect(screen.getByRole('link', { name: 'View My Work' }).getAttribute('href')).toBe('/projects');
    expect(screen.getByRole('link', { name: 'View all projects' }).getAttribute('href')).toBe('/projects');
    expect(screen.queryByText('Josh Mercer')).toBeNull();
  });

  it('features only repository projects, never résumé-only projects or demo work', () => {
    render(<App pathname="/projects" />);
    expect(screen.getByRole('heading', { name: 'My recent work' })).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(projects.map(({ name }) => name)).toEqual(['TaskFlow', 'Weather Dashboard', 'Personal Portfolio']);
    for (const name of ['TaskFlow', 'Weather Dashboard', 'Personal Portfolio']) {
      expect(screen.getByRole('article', { name: `${name} project` })).toBeTruthy();
    }
    expect(document.body.textContent).not.toMatch(/LabVR|Gen-Z Fashion|AI Resume Analyzer|Resume Builder|DeepResearch AI|Project One|Project Two/);
    expect(screen.queryByText('Preview')).toBeNull();
    expect(screen.getAllByRole('link', { name: /live site/ })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /source code/ })).toHaveLength(3);
  });

  it('offers a return home on an unknown route', () => {
    render(<App pathname="/not-a-page" />);
    expect(screen.getByRole('link', { name: 'Back home' }).getAttribute('href')).toBe('/');
    expect(getPage('/projects/')).toBe('projects');
  });

  it('uses the résumé email, LinkedIn and GitHub rather than unconfigured social links', () => {
    render(<App pathname="/" />);
    expect(screen.getByRole('link', { name: 'Email' }).getAttribute('href')).toBe(`mailto:${profile.email}`);
    expect(screen.getByRole('link', { name: 'LinkedIn' }).getAttribute('href')).toBe('https://www.linkedin.com/in/priyanshu-joshi0105');
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe('https://github.com/joshipriyanshu125');
    expect(screen.queryByRole('button', { name: /details coming soon/ })).toBeNull();
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

describe('résumé content and About interactions', () => {
  it('shows one honest experience entry with details and no invented dates or roles', () => {
    render(<App pathname="/about" />);
    const experience = screen.getByRole('region', { name: 'Experience' });
    expect(within(experience).getAllByRole('heading', { level: 3 })).toHaveLength(1);
    expect(within(experience).getByText('Independent Full-Stack Developer')).toBeTruthy();
    expect(within(experience).getByText('Project Experience')).toBeTruthy();
    expect(within(experience).getByText(/20\+ REST API endpoints/)).toBeTruthy();
    expect(within(experience).queryByText(/Present|Start|End/)).toBeNull();
    expect(screen.queryByRole('button', { name: /^Show \d+ more/ })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Education' })).toBeTruthy();
  });

  it('renders all three education entries including grades, coursework and graduation year', () => {
    render(<App pathname="/about" />);
    const education = screen.getByRole('region', { name: 'Education' });
    expect(within(education).getAllByRole('heading', { level: 3 })).toHaveLength(3);
    for (const text of ['Expected 2027', 'CGPA: 7.3/10', 'Score: 86%', 'Score: 88%', 'Class XII — CBSE', 'Class X — CBSE']) {
      expect(within(education).getByText(text)).toBeTruthy();
    }
    expect(within(education).getByText(/Coursework:.*Software Engineering/)).toBeTruthy();
  });

  it('shows the full skills, certifications and achievements without the template stack', () => {
    render(<App pathname="/about" />);
    for (const section of ['What I do', 'Stack', 'Technical skills', 'Soft skills', 'Certifications', 'Achievements']) {
      expect(screen.getByRole('heading', { name: section })).toBeTruthy();
    }
    expect(within(screen.getByRole('region', { name: 'Certifications' })).getAllByRole('listitem')).toHaveLength(4);
    expect(within(screen.getByRole('region', { name: 'Achievements' })).getByText(/Top 25/)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^Move / })).toHaveLength(about.stack.length);
    expect(screen.queryByRole('button', { name: /Move (Figma|Next.js|TypeScript)/ })).toBeNull();
    expect(document.body.textContent).not.toMatch(/Sample details|Your Name|Your latest|Your university/);
  });

  it('uses the résumé location and functional phone/email links in About', () => {
    render(<App pathname="/about" />);
    expect(screen.getByText('Bhimtal, Uttarakhand, India')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Call Priyanshu Joshi/ }).getAttribute('href')).toBe('tel:+919105131502');
    expect(screen.getByRole('link', { name: 'Send email to Priyanshu Joshi' }).getAttribute('href')).toBe(`mailto:${profile.email}`);
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

describe('project link and image boundaries', () => {
  it('replaces an unavailable image with a local fallback without a retry loop', () => {
    render(<ProjectCard project={{ ...projects[0], url: '', repositoryUrl: '' }} />);
    const image = screen.getByRole('img');
    fireEvent.error(image);
    expect(image.getAttribute('src')).toBe('/images/placeholder.svg');
    fireEvent.error(image);
    expect(image.getAttribute('src')).toBe('/images/placeholder.svg');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('makes a configured project link accessible and safe to open in a new tab', () => {
    render(<ProjectCard project={{ ...projects[0], url: 'https://example.com/project', demo: false }} />);
    const link = screen.getByRole('link', { name: 'Visit TaskFlow live site — opens in a new tab' });
    expect(link.getAttribute('href')).toBe('https://example.com/project');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(screen.queryByText('Preview')).toBeNull();
  });

  it('does not invent a live deployment for this portfolio', () => {
    render(<ProjectCard project={projects.find(({ id }) => id === 'portfolio')} />);
    expect(screen.queryByRole('link', { name: /live site/ })).toBeNull();
    expect(screen.getByRole('link', { name: /source code/ }).getAttribute('href')).toContain('/Week6/portfolio');
    expect(screen.getByText('Illustrative project overview')).toBeTruthy();
  });
});
