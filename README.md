# 🗺️ KCC Campus Map (Accessible Interactive Map)

An accessible, WCAG 2.1 AA–compliant interactive campus map for Kankakee Community College built with **React**, **Vite**, **Leaflet**, and **React-Leaflet**.

This project replaces the legacy static PDF campus map with an interactive, keyboard-operable, screen-reader-friendly campus navigation experience. It is designed as a **public-facing accessibility bridge solution** that supports the DOJ ADA WCAG 2.1 AA compliance timeline and is intentionally separate from the College’s longer-term enterprise wayfinding initiative.

---

## 🎯 Project Purpose

This map is designed to support:

- public-facing campus navigation
- accessible building discovery
- parking and entrance wayfinding
- student services discovery
- destination search
- campus-specific accessibility needs
- text alternatives for all mapped locations

This project is **not** intended to replicate every room number, office, or internal facilities inventory reference from the old PDF maps.

The focus is:

- buildings
- parking
- accessible entrances
- landmarks
- safety and emergency locations
- student-facing destinations
- service locations

---

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **Leaflet**
- **React-Leaflet**
- **Vanilla CSS**
- **Lucide React**

---

## 🚀 Current Features

### ✔ Viewer Mode (Default)

- Static image-overlay campus map
- Keyboard panning and zoom
- Accordion directory grouped by category
- Search across buildings, parking, and descriptions
- Directory click → `flyTo` → popup opens automatically
- Previously open popup closes before the next opens
- Accessible popup content with:
  - title
  - description
  - image
  - resource links
  - service notes
- Skip links to map and directory
- Screen-reader live announcements
- Mobile and desktop compatible

### ✔ Editor Mode (`?edit=true`)

Editor mode supports:

- add markers
- drag markers
- edit marker metadata
- export JSON
- download CSV
- import CSV
- manage popup resource content

Current editable fields:

- `name`
- `desc`
- `category`
- `glyph`
- `url`
- `img`
- `imgAlt`
- `resources`

---

## 🧭 Accessibility Support (WCAG 2.1 AA)

The map is intentionally built around accessibility-first interaction.

### Keyboard support

| Action | Key |
|---|---|
| Pan | Arrow keys |
| Zoom in | `+` or `=` |
| Zoom out | `-` |
| Reset center | `Home` |
| Fit full map | `End` |
| Open directory item | `Enter` |
| Skip to map | Skip link |
| Skip to directory | Skip link |

### Accessibility patterns implemented

- WCAG 2.1 AA focus states
- keyboard-operable map region
- `aria-live` announcements
- grouped accordion directory as text alternative
- accessible popup links
- no pointer-only interaction requirements
- visible focus indicators
- logical reading order

---

## 🖼️ Map Image Model

The campus map uses a **static high-resolution image overlay**, not GIS coordinates.

```text
public/maps/kcc-campus.png
```

All marker coordinates use image pixel positioning:

```js
xy: [y, x]
```

This allows precise placement over the designed campus illustration while preserving accessibility and full keyboard control.

---

## 📦 Feature Data Model

Each map feature currently supports:

```js
{
  id: "bldg-g",
  name: "Building G – Activities Center",
  xy: [1038, 1455],
  desc: "Gymnasium and student activities center.",
  category: "building",
  glyph: "G",
  url: "/facilities/activities-center",
  img: "/images/map/building-g.jpg",
  imgAlt: "Building G entry facing Parking Lot 5",
  resources: {
    heading: "Available Services & Resources",
    links: [
      { "label": "Admissions", "href": "/admissions" }
    ],
    notes: [
      "Accessible restrooms near north entrance"
    ]
  }
}
```

### Resource model

Popup resource content is structured as:

- `resources.heading`
- `resources.links[]`
- `resources.notes[]`

This replaces the need for raw HTML in popup content and keeps rendering safer and easier to maintain.

---

## 📁 Current File Structure

The project is now transitioning from a single-file architecture into controlled modules.

```text
src/
  App.jsx
  AccessibleCampusMap.jsx
  map.css
  data/
    mapData.js
  utils/
    mapIcons.js
    mapUtils.js
  components/
    Announcer.jsx
    Controls.jsx
    DirectoryFlyTo.jsx
    FeatureEditor.jsx
    PopupResources.jsx
```

### Ownership model

- `AccessibleCampusMap.jsx` → orchestration + state
- `data/` → map seed data + directory sections
- `utils/` → icons, CSV, parsing
- `components/` → focused UI and behavior modules

This structure reduces regression risk as popup logic, editor mode, and multiple datasets continue to evolve.

---

## 💾 CSV Import / Export

Supported CSV fields:

| Column | Description |
|---|---|
| `id` | Unique identifier |
| `name` | Building or destination |
| `category` | building, parking, entrance, landmark, service |
| `desc` | Accessible description |
| `y` / `x` | Image pixel coordinates |
| `url` | Optional detail page |
| `img` | Optional image |
| `imgAlt` | Required if image is present |
| `glyph` | Marker badge text |
| `resourcesJson` | Popup resource object |

CSV import replaces the active in-memory dataset.

JSON export remains the source of truth for persisting production-ready seed data.

---

## 🛠️ Development

### Install

```bash
npm install
```

### Run local development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

Deploy the `dist/` folder to any static host:

- CloudCannon
- AWS S3 / CloudFront
- institutional web infrastructure
- other static hosting environments

---

## 🗺️ Current Refinement Roadmap

### Near-term

- replace raw resources JSON textarea with structured add/remove UI
- support multiple campus datasets (Main, SEC, MITC)
- enrich student services and public destinations
- improve popup timing under rapid repeated clicks
- improve mobile directory interaction patterns

### Mid-term

- campus switcher
- destination-first search experience
- service category enrichment
- analytics for most-used destinations
- CMS-connected dataset workflows

---

## 👤 Project Owner

**Roger J. Ehmpke**  
Director of Web Strategy and Digital Experience  
Kankakee Community College

