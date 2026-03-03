/** Wrapper around Material Symbols Outlined */
export default function Icon({ name, filled, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "icon-filled" : ""} ${className}`}
    >
      {name}
    </span>
  );
}
