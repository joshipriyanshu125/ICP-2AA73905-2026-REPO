import Icon from './Icon.jsx';

function handleImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = '/images/placeholder.svg';
}

export default function ProjectCard({ project }) {
  const url = typeof project.url === 'string' ? project.url.trim() : '';
  const repositoryUrl = typeof project.repositoryUrl === 'string' ? project.repositoryUrl.trim() : '';

  return (
    <article className="project-card" aria-label={`${project.name} project`}>
      <header className="project-card__header">
        <span className="project-card__icon">
          <Icon name={project.icon} size={18} aria-hidden="true" />
        </span>
        <span className="project-card__name">{project.name}</span>
        {project.weekLabel && <span className="project-card__week">{project.weekLabel}</span>}
        {project.demo && <span className="project-card__preview">Preview</span>}
      </header>

      <figure>
        <div className="project-card__image-wrap" style={{ aspectRatio: project.aspectRatio || '4 / 3' }}>
          <img
            className="project-card__image"
            src={project.image || '/images/placeholder.svg'}
            alt={project.imageAlt || `${project.name} preview`}
            loading="eager"
            decoding="async"
            onError={handleImageError}
          />
        </div>
        {project.imageCaption && <figcaption className="project-card__caption">{project.imageCaption}</figcaption>}
      </figure>

      <div className="project-card__body">
        <h3 className="project-card__headline">{project.headline}</h3>
        <p className="project-card__description">{project.description}</p>
        {project.technologies?.length > 0 && (
          <ul className="project-card__technologies" aria-label={`${project.name} technologies`}>
            {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
          </ul>
        )}
        <p className="project-card__meta">
          <span>{project.role}</span>
          <span aria-hidden="true">/</span>
          <span>{project.year}</span>
        </p>
        {(url || repositoryUrl) && <div className="project-card__links">
          {url && <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} live site — opens in a new tab`}>Live site <Icon name="external-link" size={14} /></a>}
          {repositoryUrl && <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.name} source code — opens in a new tab`}><Icon name="github" size={15} /> Source code</a>}
        </div>}
      </div>
    </article>
  );
}
