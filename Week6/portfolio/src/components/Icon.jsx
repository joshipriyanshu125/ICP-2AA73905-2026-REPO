const paths = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
  'arrow-right': <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  moon: <path d="M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z" />,
  copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  linkedin: <><path d="M5 9v11M5 4v.01M10 20V9h4v2c3-4 7-2 7 2v7m-7-8v8" /></>,
  github: <path d="M9 21v-3c-4 1-4-2-6-2m12 5v-4c0-1-.3-1.7-.8-2.2C18 14.4 20 12.8 20 9c0-1.2-.4-2.2-1.2-3 .1-.7.2-2-.4-3-1.7 0-2.8.8-3.5 1.3a13 13 0 0 0-5.8 0C8.4 3.8 7.3 3 5.6 3c-.6 1-.5 2.3-.4 3A4.4 4.4 0 0 0 4 9c0 3.8 2 5.4 5.8 5.8-.5.5-.8 1.2-.8 2.2" />,
  'external-link': <><path d="M14 3h7v7m0-7L10 14" /><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /></>,
  x: <><path d="m4 3 16 18h-5L4 3Zm0 18 6-7m4-5 6-6" /></>,
  sparkles: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4" /></>,
  asterisk: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />,
  chart: <><path d="M4 18V6m5 12V9m5 9V4m5 14v-7" /></>,
  music: <><path d="M9 17V5l11-2v12M9 9l11-2" /><ellipse cx="6" cy="18" rx="3" ry="2" /><ellipse cx="17" cy="16" rx="3" ry="2" /></>,
  notebook: <><rect x="5" y="3" width="15" height="18" rx="2" /><path d="M9 3v18M3 7h4m-4 5h4m-4 5h4m6-9h4m-4 4h4" /></>,
  message: <path d="M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5Z" />,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V4h8v3M3 12l9 3 9-3m-9 1v4" /></>,
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
  layers: <><path d="m3 7 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 17l9 5 9-5" /></>,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'rotate-ccw': <><path d="M3 10a9 9 0 1 1 1 8M3 3v7h7" /></>,
};

export default function Icon({ name, size = 18, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.sparkles}</svg>;
}
