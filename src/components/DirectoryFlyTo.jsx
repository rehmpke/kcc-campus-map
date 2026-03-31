// src/components/DirectoryFlyTo.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function DirectoryFlyTo({
  action,
  markerRefs,
  openPopupIdRef,
  setSelected,
}) {
  const map = useMap();

  useEffect(() => {
    if (!action?.xy) return;

    const [y, x] = action.xy;
    const latlng = L.latLng(y, x);

    const closeCurrentPopup = () => {
      const openId = openPopupIdRef.current;
      const currentMarker = openId ? markerRefs.current[openId] : null;

      if (currentMarker?.closePopup) currentMarker.closePopup();
      map.closePopup();
      openPopupIdRef.current = null;
    };

    const openNextPopup = () => {
      const marker = markerRefs.current[action.id];
      if (!marker?.openPopup) return;

      closeCurrentPopup();
      marker.openPopup();
      openPopupIdRef.current = action.id;
      setSelected(action.id);
    };

    closeCurrentPopup();

    const handleMoveEnd = () => {
      window.setTimeout(openNextPopup, 40);
    };

    map.once("moveend", handleMoveEnd);
    map.flyTo(latlng, map.getZoom(), { duration: 0.4 });

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [action, map, markerRefs, openPopupIdRef, setSelected]);

  return null;
}