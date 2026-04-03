// src/components/PopupArrival.jsx
export default function PopupArrival({ arrival }) {
  if (!arrival) return null;

  const heading = arrival.heading || "Arrival & Access";
  const parking = arrival.parking?.trim();
  const entrance = arrival.entrance?.trim();
  const route = arrival.route?.trim();
  const elevator = arrival.elevator?.trim();
  const restroom = arrival.restroom?.trim();
  const serviceNote = arrival.serviceNote?.trim();
  const access = Array.isArray(arrival.access)
    ? arrival.access.filter(Boolean)
    : [];

  if (
    !parking &&
    !entrance &&
    !route &&
    !elevator &&
    !restroom &&
    !serviceNote &&
    !access.length
  ) {
    return null;
  }

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

        {elevator ? (
          <li>
            <span className="popupArrivalLabel">Elevator:</span> {elevator}
          </li>
        ) : null}

        {restroom ? (
          <li>
            <span className="popupArrivalLabel">Restroom:</span> {restroom}
          </li>
        ) : null}

        {serviceNote ? (
          <li>
            <span className="popupArrivalLabel">Visitor guidance:</span> {serviceNote}
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