export default function Switch({ on, onToggle, label }) {
  return (
    <button
      className={`switch${on ? ' on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
    />
  );
}
