// src/components/PopupArrival.jsx
export default function PopupArrival({ arrival }) {
  if (!arrival) return null;

  const heading = arrival.heading || "Arrival & Access";
  const parking = arrival.parking?.trim();
  const entrance = arrival.entrance?.trim();
  const route = arrival.route?.trim();
  const access = Array.isArray(arrival.access)
    ? arrival.access.filter(Boolean)
    : [];

  if (!parking && !entrance && !route && !access.length) return null;

  return (
    <section className="popupArrival" aria-label={heading}>
      <div className="popupRule" aria-hidden="true" />
      <div className="popupArrivalHeading">{heading}</div>

      <ul className="popupArrivalList">
        {parking ? (
          <li>
            <span className="popupArrivalLabel">Parking:</span> {parking}
          </li>
        ) : null}

        {entrance ? (
          <li>
            <span className="popupArrivalLabel">Entrance:</span> {entrance}
          </li>
        ) : null}

        {route ? (
          <li>
            <span className="popupArrivalLabel">Route:</span> {route}
          </li>
        ) : null}

        {access.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span className="popupArrivalLabel">Access:</span> {item}
          </li>
        ))}
      </ul>
    </section>
  );
}