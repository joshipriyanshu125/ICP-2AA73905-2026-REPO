import { useState } from 'react';
import { profile } from '../data/portfolio.js';
import ContactButton from './ContactButton.jsx';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';

export default function Footer() {
  const [notice, setNotice] = useState('');
  const socialLinks = [
    { label: 'Email', icon: 'mail', url: profile.email ? `mailto:${profile.email}` : '' },
    { label: 'LinkedIn', icon: 'linkedin', url: profile.socials.linkedin },
    { label: 'X', icon: 'x', url: profile.socials.x },
  ];

  return <footer className="connect container" aria-labelledby="connect-heading">
    <Reveal className="connect-frame">
      <div className="connect-inner">
        <div className="connect-copy">
          <h2 id="connect-heading">Let’s connect</h2>
          <p>{profile.contactText}</p>
          <div className="connect-actions">
            <ContactButton />
            <a className="button button-secondary" href="/projects">See projects <Icon name="arrow-right" size={16} /></a>
          </div>
        </div>
        <div className="connect-signature">
          <div className="social-links">
            {socialLinks.map(({ label, icon, url }) => url ? (
              <a key={label} href={url} className="social-link" aria-label={label} target={label === 'Email' ? undefined : '_blank'} rel="noopener noreferrer"><Icon name={icon} size={19} /></a>
            ) : (
              <button key={label} type="button" className="social-link" aria-label={`${label} — details coming soon`} onClick={() => setNotice(`${label} details haven’t been added yet.`)}><Icon name={icon} size={19} /></button>
            ))}
          </div>
          <div className="signature-text">
            <p>{new Date().getFullYear()} © Built with React & Vite</p>
            <span>{profile.name} · Portfolio preview</span>
          </div>
          {notice && <p className="social-notice" role="status">{notice}</p>}
        </div>
      </div>
    </Reveal>
  </footer>;
}
