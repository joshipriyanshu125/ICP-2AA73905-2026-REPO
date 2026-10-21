import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { projects } from '../data/portfolio.js';
import '../styles/projects.css';

export default function Projects() {
  return (
    <section className="projects-page container" aria-labelledby="projects-heading">
      <Reveal className="projects-section-heading projects-page__heading">
        <h1 className="projects-section-heading__title" id="projects-heading">
          My recent work
        </h1>
        <p className="projects-section-heading__intro">
          TaskFlow, Weather Dashboard, and this portfolio — the work from my six-week web development journey.
        </p>
      </Reveal>

      <div className="projects-grid">
        {projects.map((project) => (
          <Reveal className="projects-grid__item" key={project.id}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
