// src/components/Announcer.jsx
export default function Announcer({ message }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}