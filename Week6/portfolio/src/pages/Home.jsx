import ContactButton from '../components/ContactButton.jsx';
import Icon from '../components/Icon.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { profile, projects } from '../data/portfolio.js';
import '../styles/projects.css';

function handlePortraitError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = '/images/placeholder.svg';
}

export default function Home() {
  return (
    <>
      <section className="home-hero container" aria-labelledby="home-heading">
        <Reveal className="home-hero__copy">
          <p className="home-hero__greeting">Hey<span aria-hidden="true"> 👋</span>, I’m {profile.firstName}</p>
          <h1 className="home-hero__title" id="home-heading">
            {profile.headline.map((line, index) => (
              <span key={`${index}-${line}`}>{line}</span>
            ))}
          </h1>
          <p className="home-hero__description">{profile.description}</p>
          <div className="home-hero__actions">
            <ContactButton />
            <a className="button button-secondary" href="/projects">
              View My Work
              <Icon name="arrow-right" size={18} aria-hidden="true" />
            </a>
          </div>
        </Reveal>

        <Reveal className="home-hero__portrait">
          <div className="home-hero__frame">
            <img
              src={profile.portrait || '/images/placeholder.svg'}
              alt={profile.portraitAlt}
              width="420"
              height="420"
              decoding="async"
              onError={handlePortraitError}
            />
          </div>
        </Reveal>
      </section>

      <section className="home-projects container" aria-labelledby="selected-projects-heading">
        <Reveal className="projects-section-heading">
          <h2 className="projects-section-heading__title" id="selected-projects-heading">
            My projects
          </h2>
          <p className="projects-section-heading__intro">
            Full-stack applications and thoughtful interfaces built during my six-week web development journey.
          </p>
        </Reveal>

        <div className="projects-grid">
          {projects.slice(0, 4).map((project) => (
            <Reveal className="projects-grid__item" key={project.id}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        <Reveal className="projects-more">
          <a className="button button-secondary" href="/projects">
            View all projects
            <Icon name="arrow-right" size={18} aria-hidden="true" />
          </a>
        </Reveal>
      </section>
    </>
  );
}
