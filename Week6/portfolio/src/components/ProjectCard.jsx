import Icon from './Icon.jsx';

function handleImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = '/images/placeholder.svg';
}

export default function ProjectCard({ project }) {
  const url = typeof project.url === 'string' ? project.url.trim() : '';
  const Card = url ? 'a' : 'article';

  return (
    <Card
      className={`project-card${url ? ' project-card--linked' : ''}`}
      href={url || undefined}
      target={url ? '_blank' : undefined}
      rel={url ? 'noreferrer' : undefined}
      aria-label={
        url
          ? `${project.name}${project.demo ? ' preview' : ''} — opens in a new tab`
          : undefined
      }
    >
      <header className="project-card__header">
        <span className="project-card__icon">
          <Icon name={project.icon} size={18} aria-hidden="true" />
        </span>
        <span className="project-card__name">{project.name}</span>
        {project.demo && <span className="project-card__preview">Preview</span>}
      </header>

      <div
        className="project-card__image-wrap"
        style={{ aspectRatio: project.aspectRatio || '4 / 3' }}
      >
        <img
          className="project-card__image"
          src={project.image || '/images/placeholder.svg'}
          alt={project.imageAlt || `${project.name} preview`}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      </div>

      <div className="project-card__body">
        <h3 className="project-card__headline">{project.headline}</h3>
        <p className="project-card__description">{project.description}</p>
        <p className="project-card__meta">
          <span>{project.role}</span>
          <span aria-hidden="true">/</span>
          <span>{project.year}</span>
        </p>
      </div>
    </Card>
  );
}
