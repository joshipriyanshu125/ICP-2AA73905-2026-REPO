import { useEffect, useId, useRef, useState } from 'react';
import { profile } from '../data/portfolio.js';
import Icon from './Icon.jsx';

export default function ContactButton({ email = profile.email }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  async function handleContact() {
    if (!open) { setOpen(true); setStatus(''); return; }
    if (!email) { setOpen(false); return; }
    try {
      await navigator.clipboard.writeText(email);
      setStatus('Email copied!');
    } catch {
      setStatus('Couldn’t copy. Select the address below or open your email app.');
    }
  }

  return (
    <div className="contact-control" ref={ref} onKeyDown={(event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        ref.current.querySelector('button')?.focus();
      }
    }}>
      <button className="button button-primary" type="button" onClick={handleContact} aria-label={open && email ? 'Copy email address' : 'Show email'} aria-expanded={open} aria-controls={id}>
        <Icon name={status === 'Email copied!' ? 'check' : open && email ? 'copy' : 'mail'} size={16} />
        <span>{open && email ? (status === 'Email copied!' ? 'Copied!' : email) : 'Contact'}</span>
      </button>
      {open && <div className="contact-popover" id={id}>
        {email ? <>
          <p className="contact-address">{email}</p>
          <a href={`mailto:${email}`}>Open email app <Icon name="arrow-right" size={14} /></a>
          <p role="status">{status || 'Click the button again to copy.'}</p>
        </> : <p role="status">Your email will appear here once you share your contact details.</p>}
      </div>}
    </div>
  );
}
