// src/components/DirectoryFlyTo.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const Y_OFFSET_PIXELS = 140;
const MIN_FOCUS_ZOOM = 0;

export default function DirectoryFlyTo({
  action,
  markerRefs,
  openPopupIdRef,
  pendingFocusIdRef,
  setSelected,
}) {
  const map = useMap();

  useEffect(() => {
    if (!action?.xy || !map) return;

    const [lat, lng] = action.xy;
    const targetZoom = Math.max(map.getZoom(), MIN_FOCUS_ZOOM);

    const closeCurrentPopup = () => {
      const openId = openPopupIdRef.current;
      const currentMarker = openId ? markerRefs.current?.[openId] : null;

      if (currentMarker?.closePopup) currentMarker.closePopup();
      openPopupIdRef.current = null;
    };

    closeCurrentPopup();

    const markerPoint = map.project([lat, lng], targetZoom);
    const adjustedCenterPoint = markerPoint.subtract([0, Y_OFFSET_PIXELS]);
    const adjustedCenterLatLng = map.unproject(adjustedCenterPoint, targetZoom);

    map.setView(adjustedCenterLatLng, targetZoom, {
      animate: false,
    });

    const frame = window.requestAnimationFrame(() => {
      const marker = markerRefs.current?.[action.id];
      if (!marker?.openPopup) return;

      pendingFocusIdRef.current = null;
      marker.openPopup();
      openPopupIdRef.current = action.id;
      setSelected(action.id);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [action, map, markerRefs, openPopupIdRef, pendingFocusIdRef, setSelected]);

  return null;
}