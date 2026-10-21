import { useEffect, useId, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { about, profile } from '../data/portfolio.js';
import '../styles/about.css';

const PHOTO_TILTS = [-9, 6, -3, 7, -7];
const PHOTO_OFFSETS = [8, -4, 5, -5, 8];
const TOOL_TILTS = [-7, 6, -4, 5, -6, 4, -3, 7, -5, 3];
const TOOL_GLYPHS = {
  javascript: 'JS', express: 'ex', python: 'Py',
};
const TOOL_ICONS = {
  nodejs: <><path d="m12 2 9 5v10l-9 5-9-5V7Z" /><path d="M8 9v6c0 1-2 1-2 0m11-5c-3-2-6 1-2 2s1 4-2 2" /></>,
  mongodb: <><path d="M12 2c-8 6-8 13 0 18 8-5 8-12 0-18Z" /><path d="M12 7v15" /></>,
  java: <><path d="M5 12h12v4a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Zm12 1h2a2 2 0 0 1 0 4h-2M3 22h16M10 9c-4-3 4-4 1-7m3 7c-2-2 3-3 2-5" /></>,
  sql: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
  tailwindcss: <><path d="M3 10c2-5 5-5 9-2s6 3 9-2M3 18c2-5 5-5 9-2s6 3 9-2" strokeWidth="3" /></>,
  git: <><path d="m12 2 10 10-10 10L2 12Z" /><path d="M8 6v5l6 6m-6-6h7" /><circle cx="8" cy="6" r="1" /><circle cx="15" cy="11" r="1" /><circle cx="14" cy="17" r="1" /></>,
  github: <><path d="M9 21v-3c-4 1-4-2-6-2m12 5v-4c0-1-.3-1.7-.8-2.2C18 14.4 20 12.8 20 9c0-1.2-.4-2.2-1.2-3 .1-.7.2-2-.4-3-1.7 0-2.8.8-3.5 1.3a13 13 0 0 0-5.8 0C8.4 3.8 7.3 3 5.6 3c-.6 1-.5 2.3-.4 3A4.4 4.4 0 0 0 4 9c0 3.8 2 5.4 5.8 5.8-.5.5-.8 1.2-.8 2.2" /></>,
  vite: <><path d="m3 4 9 17 9-17-8 2Z" /><path d="m13 2-5 10h5l-2 7 7-11h-5Z" fill="currentColor" stroke="none" /></>,
  vercel: <path d="m12 3 10 18H2Z" fill="currentColor" stroke="none" />,
  gemini: <path d="M12 2c1.3 6 4 8.7 10 10-6 1.3-8.7 4-10 10-1.3-6-4-8.7-10-10 6-1.3 8.7-4 10-10Z" fill="currentColor" stroke="none" />,
};

function ToolGlyph({ symbol }) {
  if (symbol === 'react' || symbol === 'react-native' || symbol === 'reactnative') {
    return (
      <svg viewBox="-12 -12 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
        <ellipse rx="10.5" ry="4" />
        <ellipse rx="10.5" ry="4" transform="rotate(60)" />
        <ellipse rx="10.5" ry="4" transform="rotate(120)" />
        <circle r="1.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (TOOL_ICONS[symbol]) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TOOL_ICONS[symbol]}</svg>;
  }

  return <span className="about-stack-lettermark" aria-hidden="true">{TOOL_GLYPHS[symbol] || '✦'}</span>;
}

function chipTextColor(color) {
  const channels = color.slice(1).match(/.{2}/g).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? '#000000' : '#ffffff';
}

function constrainChip(stage, chip, index, position) {
  if (!stage || !chip) return position;
  const angle = (TOOL_TILTS[index % TOOL_TILTS.length] * Math.PI) / 180;
  const width = chip.offsetWidth;
  const height = chip.offsetHeight;
  const extraX = (Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle)) - width) / 2;
  const extraY = (Math.abs(height * Math.cos(angle)) + Math.abs(width * Math.sin(angle)) - height) / 2;
  const minX = 4 + extraX - chip.offsetLeft;
  const maxX = stage.clientWidth - 4 - extraX - chip.offsetLeft - width;
  const minY = 4 + extraY - chip.offsetTop;
  const maxY = stage.clientHeight - 4 - extraY - chip.offsetTop - height;

  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}

function ToolStack() {
  const [positions, setPositions] = useState({});
  const [dragging, setDragging] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const stageRef = useRef(null);
  const chipRefs = useRef([]);
  const dragRef = useRef(null);
  const instructionsId = useId();

  useEffect(() => {
    const keepInsideStage = () => {
      setPositions((current) => {
        let next = current;
        Object.entries(current).forEach(([index, position]) => {
          const bounded = constrainChip(stageRef.current, chipRefs.current[index], Number(index), position);
          if (bounded.x !== position.x || bounded.y !== position.y) {
            if (next === current) next = { ...current };
            next[index] = bounded;
          }
        });
        return next;
      });
    };

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', keepInsideStage);
      return () => window.removeEventListener('resize', keepInsideStage);
    }

    const observer = new ResizeObserver(keepInsideStage);
    observer.observe(stageRef.current);
    chipRefs.current.forEach((chip) => { if (chip) observer.observe(chip); });
    return () => observer.disconnect();
  }, []);

  function moveChip(index, position) {
    const bounded = constrainChip(stageRef.current, chipRefs.current[index], index, position);
    setPositions((current) => ({ ...current, [index]: bounded }));
    return bounded;
  }

  function stopDragging() {
    const active = dragRef.current;
    dragRef.current = null;
    setDragging(null);
    if (active?.element.hasPointerCapture(active.pointerId)) {
      active.element.releasePointerCapture(active.pointerId);
    }
  }

  function startDrag(event, index) {
    if (event.button !== 0 || !event.isPrimary || dragRef.current) return;
    const element = event.currentTarget;
    element.focus({ preventScroll: true });
    element.setPointerCapture(event.pointerId);
    dragRef.current = {
      index, element, pointerId: event.pointerId,
      startX: event.clientX, startY: event.clientY,
      origin: positions[index] || { x: 0, y: 0 },
    };
    setDragging(index);
    setAnnouncement('');
  }

  function continueDrag(event) {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    moveChip(active.index, {
      x: active.origin.x + event.clientX - active.startX,
      y: active.origin.y + event.clientY - active.startY,
    });
  }

  function finishDrag(event) {
    if (dragRef.current?.pointerId === event.pointerId) stopDragging();
  }

  function moveWithKeyboard(event, index) {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (event.key === 'Escape') {
      event.preventDefault();
      stopDragging();
      moveChip(index, { x: 0, y: 0 });
      setAnnouncement(`${about.stack[index].name} returned to its starting position.`);
      return;
    }
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    stopDragging();
    const step = event.shiftKey ? 24 : 8;
    const current = positions[index] || { x: 0, y: 0 };
    const next = moveChip(index, { x: current.x + direction[0] * step, y: current.y + direction[1] * step });
    setAnnouncement(`${about.stack[index].name}: ${Math.round(next.x)} pixels horizontally, ${Math.round(next.y)} pixels vertically from its starting position.`);
  }

  function resetStack() {
    stopDragging();
    setPositions({});
    setAnnouncement('Stack reset to its starting arrangement.');
  }

  return (
    <div className="about-panel about-stack-panel">
      <div className="about-stack-toolbar">
        <p className="about-stack-hint">Drag or use arrow keys</p>
        <button className="about-stack-reset" type="button" onClick={resetStack} aria-label="Reset stack" title="Reset stack">
          <Icon name="rotate-ccw" />
        </button>
      </div>
      <p className="about-sr-only" id={instructionsId}>
        Drag a tool to rearrange it, or focus a tool and use the arrow keys. Hold Shift for larger steps.
        Press Escape to return one tool to its starting position. Reset stack restores all tools.
      </p>
      <div className="about-stack-stage" ref={stageRef}>
        {about.stack.map((tool, index) => {
          const position = positions[index] || { x: 0, y: 0 };
          return (
            <button
              className={`about-stack-chip${dragging === index ? ' about-stack-chip-dragging' : ''}`}
              key={tool.name}
              ref={(element) => { chipRefs.current[index] = element; }}
              type="button"
              aria-label={`Move ${tool.name}`}
              aria-describedby={instructionsId}
              onPointerDown={(event) => startDrag(event, index)}
              onPointerMove={continueDrag}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onLostPointerCapture={finishDrag}
              onKeyDown={(event) => moveWithKeyboard(event, index)}
              style={{
                backgroundColor: tool.color,
                color: chipTextColor(tool.color),
                transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${TOOL_TILTS[index % TOOL_TILTS.length]}deg)`,
              }}
            >
              <span className="about-stack-glyph"><ToolGlyph symbol={tool.symbol} /></span>
              <span className="about-stack-name">{tool.name}</span>
            </button>
          );
        })}
      </div>
      <span className="about-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
    </div>
  );
}

function ResumeRow({ item, education = false }) {
  return (
    <li className="about-resume-row">
      <span className={`about-row-icon${education ? ' about-row-initial' : ''}`} aria-hidden="true">
        {education ? item.initial : <Icon name={item.icon} />}
      </span>
      <div className="about-row-copy">
        <h3 className="about-row-title">{item.name}</h3>
        <p className="about-row-details">
          <span>{item.role}</span>
          {item.period && (
            <span className="about-row-period">
              <span className="about-detail-dot" aria-hidden="true">·</span>
              {item.period}
            </span>
          )}
        </p>
        {item.details?.length > 0 && (
          <ul className="about-row-bullets">
            {item.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        )}
      </div>
    </li>
  );
}

export default function About() {
  const [experienceExpanded, setExperienceExpanded] = useState(false);
  const [flippedPhotos, setFlippedPhotos] = useState({});
  const sectionId = useId();
  const experienceListId = `${sectionId}-experience-list`;
  const moreCount = Math.max(0, about.experience.length - 2);
  const visibleExperience = experienceExpanded ? about.experience : about.experience.slice(0, 2);
  const phoneDigits = profile.phone?.replace(/\D/g, '') || '';
  const phoneHref = phoneDigits ? `tel:${profile.phone.trim().startsWith('+') ? '+' : ''}${phoneDigits}` : '';
  const email = profile.email?.trim();
  const additionalSections = [
    { key: 'soft-skills', title: 'Soft skills', items: about.softSkills },
    { key: 'certifications', title: 'Certifications', items: about.certifications },
    { key: 'achievements', title: 'Achievements', items: about.achievements },
  ];

  return (
    <>
      <section className="about-photos" aria-label="A little visual inspiration">
        <Reveal>
          <div className="about-photo-scroll" role="region" aria-label="Decorative moodboard; tap a card to turn it over" tabIndex={0}>
            <div className="about-photo-strip">
              {about.photos.map((photo, index) => (
                <button
                  type="button"
                  className={`about-photo${flippedPhotos[index] ? ' about-photo--flipped' : ''}`}
                  key={photo.src}
                  aria-label={`Turn over photo ${index + 1}`}
                  aria-pressed={Boolean(flippedPhotos[index])}
                  onClick={() => setFlippedPhotos((current) => ({ ...current, [index]: !current[index] }))}
                  style={{ '--about-photo-tilt': `${PHOTO_TILTS[index % PHOTO_TILTS.length]}deg`, '--about-photo-y': `${PHOTO_OFFSETS[index % PHOTO_OFFSETS.length]}px` }}
                >
                  <span className="about-photo-flipper">
                    <span className="about-photo-back" aria-hidden="true" />
                    <img src={photo.src} alt={photo.alt} width="288" height="384" loading={index === 2 ? 'eager' : 'lazy'} decoding="async" draggable="false" onError={(event) => {
                      if (!event.currentTarget.dataset.fallbackApplied) {
                        event.currentTarget.dataset.fallbackApplied = 'true';
                        event.currentTarget.src = '/images/placeholder.svg';
                      }
                    }} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="about-biography" aria-labelledby={`${sectionId}-hello`}>
        <Reveal className="about-bio-card">
          <h1 className="about-heading" id={`${sectionId}-hello`}>Hello! I’m <span>{profile.name}</span>.</h1>
          {profile.location && <p className="about-location">{profile.location}</p>}
          {(phoneHref || email) && (
            <div className="about-contact-links">
              {phoneHref && <a href={phoneHref} aria-label={`Call ${profile.name} at ${profile.phone}`}>{profile.phone}</a>}
              {email && <a href={`mailto:${email}`} aria-label={`Send email to ${profile.name}`}>Send email</a>}
            </div>
          )}
          <div className="about-biography-copy">
            {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </Reveal>
      </section>

      <div className="about-resume">
        <section className="about-resume-section" aria-labelledby={`${sectionId}-experience`}>
          <Reveal>
            <h2 className="about-section-label" id={`${sectionId}-experience`}>Experience</h2>
            <div className="about-panel">
              <ul className="about-resume-list" id={experienceListId}>
                {visibleExperience.map((item) => <ResumeRow item={item} key={`${item.name}-${item.role}-${item.period}`} />)}
              </ul>
              {moreCount > 0 && (
                <button
                  className="about-expand-button"
                  type="button"
                  aria-expanded={experienceExpanded}
                  aria-controls={experienceListId}
                  onClick={() => setExperienceExpanded((expanded) => !expanded)}
                >
                  {experienceExpanded ? 'Show less' : `Show ${moreCount} more`}
                  <span className={`about-expand-icon${experienceExpanded ? ' about-expand-icon-open' : ''}`} aria-hidden="true"><Icon name="chevron-down" /></span>
                </button>
              )}
            </div>
          </Reveal>
        </section>

        <section className="about-resume-section" aria-labelledby={`${sectionId}-education`}>
          <Reveal>
            <h2 className="about-section-label" id={`${sectionId}-education`}>Education</h2>
            <div className="about-panel">
              <ul className="about-resume-list">
                {about.education.map((item) => <ResumeRow item={item} education key={`${item.name}-${item.role}-${item.period}`} />)}
              </ul>
            </div>
          </Reveal>
        </section>

        <section className="about-resume-section" aria-labelledby={`${sectionId}-skills`}>
          <Reveal>
            <h2 className="about-section-label" id={`${sectionId}-skills`}>What I do</h2>
            <div className="about-panel about-skills-panel">
              <ul className="about-skills-list">
                {about.skills.map((skill) => <li className="about-skill" key={skill}>{skill}</li>)}
              </ul>
            </div>
          </Reveal>
        </section>

        <section className="about-resume-section" aria-labelledby={`${sectionId}-stack`}>
          <Reveal>
            <h2 className="about-section-label" id={`${sectionId}-stack`}>Stack</h2>
            <ToolStack />
          </Reveal>
        </section>

        {about.technicalSkills?.length > 0 && (
          <section className="about-resume-section" aria-labelledby={`${sectionId}-technical-skills`}>
            <Reveal>
              <h2 className="about-section-label" id={`${sectionId}-technical-skills`}>Technical skills</h2>
              <div className="about-panel about-technical-panel">
                {about.technicalSkills.map((group) => (
                  <div className="about-technical-group" key={group.category}>
                    <h3 className="about-group-label">{group.category}</h3>
                    <ul className="about-technical-list">
                      {group.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        )}

        {additionalSections.filter(({ items }) => items?.length > 0).map(({ key, title, items }) => (
          <section className="about-resume-section" aria-labelledby={`${sectionId}-${key}`} key={key}>
            <Reveal>
              <h2 className="about-section-label" id={`${sectionId}-${key}`}>{title}</h2>
              <div className="about-panel about-list-panel">
                <ul className="about-detail-list">
                  {items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </Reveal>
          </section>
        ))}
      </div>
    </>
  );
}
