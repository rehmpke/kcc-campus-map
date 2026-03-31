// src/components/FeatureEditor.jsx
import { useEffect, useState } from "react";
import { safeParseResourcesJson } from "../utils/mapUtils";

export default function FeatureEditor({ feature, onChange }) {
  if (!feature) return null;

  const [name, setName] = useState(feature.name);
  const [desc, setDesc] = useState(feature.desc || "");
  const [category, setCategory] = useState(feature.category || "building");
  const [url, setUrl] = useState(feature.url || "");
  const [img, setImg] = useState(feature.img || "");
  const [imgAlt, setImgAlt] = useState(feature.imgAlt || "");
  const [glyph, setGlyph] = useState(feature.glyph || "");
  const [resourcesJson, setResourcesJson] = useState(
    feature.resources ? JSON.stringify(feature.resources, null, 2) : ""
  );

  useEffect(() => {
    setName(feature.name);
    setDesc(feature.desc || "");
    setCategory(feature.category || "building");
    setUrl(feature.url || "");
    setImg(feature.img || "");
    setImgAlt(feature.imgAlt || "");
    setGlyph(feature.glyph || "");
    setResourcesJson(feature.resources ? JSON.stringify(feature.resources, null, 2) : "");
  }, [feature.id]);

  useEffect(() => onChange(feature.id, "name", name), [name]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onChange(feature.id, "desc", desc), [desc]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onChange(feature.id, "category", category), [category]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onChange(feature.id, "url", url), [url]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onChange(feature.id, "img", img), [img]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onChange(feature.id, "imgAlt", imgAlt), [imgAlt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onChange(feature.id, "glyph", glyph), [glyph]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const parsed = safeParseResourcesJson(resourcesJson);
    onChange(feature.id, "resources", parsed);
  }, [resourcesJson]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="form">
      <label className="lb">
        Name
        <input className="txt" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="lb">
        Description
        <textarea
          className="txt"
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </label>

      <label className="lb">
        Category
        <select className="txt" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="building">Building</option>
          <option value="parking">Parking</option>
          <option value="entrance">Accessible Entrance</option>
          <option value="landmark">Landmark</option>
          <option value="service">Service</option>
          <option value="emergency">Emergency / Safety</option>
          <option value="assembly">Assembly Point</option>
          <option value="campus">Campus Location</option>
          <option value="wifi">Outdoor Wi-Fi</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="lb">
        Marker glyph (optional – letter/number)
        <input className="txt" value={glyph} onChange={(e) => setGlyph(e.target.value)} />
      </label>

      <label className="lb">
        Facility page URL
        <input className="txt" value={url} onChange={(e) => setUrl(e.target.value)} />
      </label>

      <label className="lb">
        Image URL
        <input className="txt" value={img} onChange={(e) => setImg(e.target.value)} />
      </label>

      <label className="lb">
        Image alt text
        <input className="txt" value={imgAlt} onChange={(e) => setImgAlt(e.target.value)} />
      </label>

      <label className="lb">
        Resources JSON
        <textarea
          className="txt"
          rows={10}
          value={resourcesJson}
          onChange={(e) => setResourcesJson(e.target.value)}
          placeholder={`{
  "heading": "Available Services & Resources",
  "links": [
    { "label": "Admissions", "href": "/admissions" },
    { "label": "Bookstore", "href": "/bookstore" }
  ],
  "notes": [
    "Outdoor Wi-Fi available."
  ]
}`}
        />
      </label>

      <div className="help">
        Use structured JSON for popup resources. This is safer and easier to maintain than raw HTML.
      </div>

      <div className="help">
        Drag the marker on the map to reposition. Coordinates are saved automatically.
      </div>
    </div>
  );
}