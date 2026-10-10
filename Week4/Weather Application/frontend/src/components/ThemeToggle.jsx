import { useTheme } from '../context/ThemeContext.jsx';

/** Sun / moon theme switch with smooth rotation. */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
