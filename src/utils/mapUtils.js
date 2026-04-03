// src/utils/mapUtils.js

export function safeParseArrivalJson(value) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    return undefined;
  }

  return undefined;
}

export function safeParseResourcesJson(value) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    return undefined;
  }

  return undefined;
}

export function featuresToCSV(rows) {
  const header = [
    "id",
    "name",
    "category",
    "desc",
    "y",
    "x",
    "url",
    "img",
    "imgAlt",
    "glyph",
    "arrivalJson",
    "resourcesJson",
  ];

  const body = rows.map((r) => [
    r.id,
    r.name,
    r.category || "",
    String(r.desc || "").replace(/\r?\n/g, " "),
    Math.round(r.xy[0]),
    Math.round(r.xy[1]),
    r.url || "",
    r.img || "",
    r.imgAlt || "",
    r.glyph || "",
    r.arrival ? JSON.stringify(r.arrival) : "",
    r.resources ? JSON.stringify(r.resources) : "",
  ]);

  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [header.join(","), ...body.map((a) => a.map(esc).join(","))].join("\n");
}

export function parseCSV(text, dims) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0]
    .split(",")
    .map((h) => h.replace(/"/g, "").trim().toLowerCase());

  const idx = {
    id: header.indexOf("id"),
    name: header.indexOf("name"),
    category: header.indexOf("category"),
    desc: header.indexOf("desc"),
    y: header.indexOf("y"),
    x: header.indexOf("x"),
    url: header.indexOf("url"),
    img: header.indexOf("img"),
    imgAlt: header.indexOf("imgalt"),
    glyph: header.indexOf("glyph"),
    arrivalJson: header.indexOf("arrivaljson"),
    resourcesJson: header.indexOf("resourcesjson"),
  };

  return lines.slice(1).map((line) => {
    const cols =
      line
        .match(/"([^"]|"")*"|[^,]+/g)
        ?.map((s) => s.replace(/^"|"$/g, "").replace(/""/g, '"')) || [];

    const id = cols[idx.id] || `pt-${crypto.randomUUID?.() || Date.now()}`;
    const name = cols[idx.name] || "Untitled";
    const category = cols[idx.category] || "building";
    const desc = cols[idx.desc] || "";
    const y = parseFloat(cols[idx.y]);
    const x = parseFloat(cols[idx.x]);

    const xy =
      Number.isFinite(y) && Number.isFinite(x)
        ? [y, x]
        : [dims?.height / 2 || 0, dims?.width / 2 || 0];

    const url = idx.url >= 0 ? cols[idx.url] : "";
    const img = idx.img >= 0 ? cols[idx.img] : "";
    const imgAlt = idx.imgAlt >= 0 ? cols[idx.imgAlt] : "";
    const glyph = idx.glyph >= 0 ? cols[idx.glyph] : "";
    const arrival =
      idx.arrivalJson >= 0
        ? safeParseArrivalJson(cols[idx.arrivalJson])
        : undefined;
    const resources =
      idx.resourcesJson >= 0
        ? safeParseResourcesJson(cols[idx.resourcesJson])
        : undefined;

    return {
      id,
      name,
      category,
      desc,
      xy,
      url,
      img,
      imgAlt,
      glyph,
      arrival,
      resources,
    };
  });
}