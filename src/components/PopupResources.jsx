// src/components/PopupResources.jsx
export default function PopupResources({ resources }) {
  if (!resources) return null;

  const heading = resources.heading || "Resources";
  const links = Array.isArray(resources.links) ? resources.links : [];
  const notes = Array.isArray(resources.notes) ? resources.notes : [];

  if (!links.length && !notes.length) return null;

  return (
    <section className="popupResources" aria-label={heading}>
      <div className="popupRule" aria-hidden="true" />
      <div className="popupResourcesHeading">{heading}</div>

      {links.length > 0 && (
        <ul className="popupResourceList">
          {links.map((item, index) => {
            const label = item?.label?.trim();
            const href = item?.href?.trim();
            if (!label || !href) return null;

            const isExternal = /^https?:\/\//i.test(href);

            return (
              <li key={`${label}-${index}`}>
                <a
                  className="popupResourceLink"
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {notes.length > 0 && (
        <ul className="popupNoteList">
          {notes.map((note, index) =>
            note ? <li key={`${note}-${index}`}>{note}</li> : null
          )}
        </ul>
      )}
    </section>
  );
}