# 🗺️ KCC Campus Map (Accessible Interactive Map)

An accessible, WCAG 2.1 AA–compliant interactive campus map for Kankakee Community College built with **React**, **Vite**, **Leaflet**, and **React-Leaflet**.

This project replaces the legacy static PDF campus map with an interactive, keyboard-operable, screen-reader-friendly campus navigation experience. It is designed as a **public-facing accessibility bridge solution** that supports the DOJ ADA WCAG 2.1 AA compliance timeline and remains intentionally separate from the College’s longer-term enterprise wayfinding initiative.

---

## 🎯 Project Purpose

This map is designed to support:

- public-facing campus navigation
- accessible building discovery
- parking and entrance wayfinding
- student services discovery
- destination-first search
- campus-specific accessibility needs
- text alternatives for all mapped locations
- public bridge wayfinding before enterprise campus wayfinding matures

This project is **not intended to recreate every room number, office, or internal facilities inventory reference** from the legacy PDF maps.

The focus is:

- buildings
- parking
- accessible entrances
- landmarks
- safety and emergency locations
- student-facing destinations
- service locations
- accessible arrival instructions

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

- Static image-overlay campus map using **Leaflet Simple CRS**
- Keyboard panning and zoom
- Accordion directory grouped by category
- Destination-first ranked search across:
  - building names
  - descriptions
  - popup resource link labels
  - resource notes
  - arrival and access guidance
- Search result selection:
  - flies to the marker
  - opens the popup
  - syncs directory selected state
  - collapses search results after destination selection
  - keeps search text visible for orientation
- Directory click → unified destination focus behavior
- Marker click uses the same popup focus pipeline
- Selected marker animation state
- Accessible popup content with:
  - title
  - description
  - image
  - **Arrival & Access**
  - **Available Services & Resources**
  - footer CTA zone
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
- manage popup resources
- manage arrival and access guidance

Current editable fields:

- `name`
- `desc`
- `category`
- `glyph`
- `url`
- `img`
- `imgAlt`
- `arrival`
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
- logical reading order
- no pointer-only interaction requirements
- visible focus indicators
- text-equivalent arrival guidance
- mobile-safe popup reading flow

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
  imgAlt: "Building G entry from the P1 parking area",

  arrival: {
    heading: "Arrival & Access",
    parking: "Closest accessible parking: Lot P1",
    entrance: "Main entrance facing the P1 parking area",
    route: "Use the short sidewalk crossing from P1 directly to Building G.",
    elevator: "Available inside main lobby",
    restroom: "Accessible restrooms near lobby entrance"
  },

  resources: {
    heading: "Available Services & Resources",
    links: [
      { label: "Athletics", href: "/athletics" },
      { label: "Fitness Center", href: "/fitness-center" }
    ],
    notes: [
      "Public event seating available."
    ]
  }
}
```

### Arrival model

Popup arrival content is structured as:

- `arrival.heading`
- `arrival.parking`
- `arrival.entrance`
- `arrival.route`
- `arrival.elevator`
- `arrival.restroom`

### Resource model

Popup resource content is structured as:

- `resources.heading`
- `resources.links[]`
- `resources.notes[]`

This keeps popup rendering safe, structured, and maintainable.

---

## 📁 Current File Structure

The project is now fully modularized and should **not be collapsed back into a single-file implementation**.

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
    PopupArrival.jsx
    PopupResources.jsx
```

### Ownership model

- `AccessibleCampusMap.jsx` → orchestration + state + selection flow
- `data/` → seed map datasets + directory sections
- `utils/` → icons, CSV, parsing helpers
- `components/Controls.jsx` → search + admin controls
- `components/DirectoryFlyTo.jsx` → viewport + popup sync
- `components/PopupArrival.jsx` → arrival guidance rendering
- `components/PopupResources.jsx` → services/resources rendering
- `components/FeatureEditor.jsx` → editor mode metadata updates

This structure reduces regression risk as:
- popup logic evolves
- search ranking improves
- multiple campus datasets are added
- editor workflows mature

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
| `arrivalJson` | Structured arrival object |
| `resourcesJson` | Structured resource object |

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

- standardize arrival/access data for major public buildings
- replace raw resources JSON textarea with structured add/remove UI
- add structured arrival editing in editor mode
- support multiple campus datasets:
  - Main
  - Riverfront
  - SEC
  - MITC
- continue popup rhythm and spacing polish
- enrich destination-level service metadata

### Mid-term

- campus switcher
- campus-aware search
- service category enrichment
- analytics for most-used destinations
- CMS-connected dataset workflows
- public event and seasonal routing overlays

---

## 👤 Project Owner

**Roger J. Ehmpke**  
Director of Web Strategy and Digital Experience  
Kankakee Community College