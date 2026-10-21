import { useEffect, useId, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { about, profile } from '../data/portfolio.js';
import '../styles/about.css';

const PHOTO_TILTS = [-9, 6, -3, 7, -7];
const PHOTO_OFFSETS = [8, -4, 5, -5, 8];
const TOOL_TILTS = [-7, 6, -4, 5, -6, 4, -3, 7, -5, 3];
const TOOL_GLYPHS = {
  nextdotjs: 'N', typescript: 'TS', shadcnui: '//', cursor: '↖',
  gsap: 'ϟ', github: '{}', vercel: '▲', tailwindcss: '≈',
};

function ToolGlyph({ symbol }) {
  if (symbol === 'figma') {
    return (
      <svg viewBox="0 0 18 24" fill="none" aria-hidden="true">
        <path d="M5 1a4 4 0 1 0 0 8h4V1H5Z" fill="#f24e1e" />
        <path d="M9 1h4a4 4 0 0 1 0 8H9V1Z" fill="#ff7262" />
        <path d="M5 9a4 4 0 1 0 0 8h4V9H5Z" fill="#a259ff" />
        <circle cx="13" cy="13" r="4" fill="#1abcfe" />
        <path d="M5 17a4 4 0 1 0 4 4v-4H5Z" fill="#0acf83" />
      </svg>
    );
  }

  if (symbol === 'react') {
    return (
      <svg viewBox="-12 -12 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
        <ellipse rx="10.5" ry="4" />
        <ellipse rx="10.5" ry="4" transform="rotate(60)" />
        <ellipse rx="10.5" ry="4" transform="rotate(120)" />
        <circle r="1.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return <span aria-hidden="true">{TOOL_GLYPHS[symbol] || '✦'}</span>;
}

function chipTextColor(color) {
  const channels = color.slice(1).match(/.{2}/g).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? '#101010' : '#ffffff';
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
              <span>{tool.name}</span>
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
          <span className="about-detail-dot" aria-hidden="true">·</span>
          <span>{item.period}</span>
        </p>
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

  return (
    <>
      <section className="about-photos" aria-label="A little visual inspiration">
        <Reveal>
          <div className="about-photo-scroll" role="region" aria-label="Placeholder photo moodboard; tap a card to turn it over" tabIndex={0}>
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
          <p className="about-sample-note">Sample details · ready for your story</p>
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
                {visibleExperience.map((item) => <ResumeRow item={item} key={item.name} />)}
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
                {about.education.map((item) => <ResumeRow item={item} education key={item.name} />)}
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
      </div>
    </>
  );
}
