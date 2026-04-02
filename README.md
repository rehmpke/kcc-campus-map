# 🗺️ KCC Campus Map (Accessible Interactive Wayfinding)

An accessible, WCAG 2.1 AA–aligned interactive campus map for **Kankakee Community College** built with **React, Vite, Leaflet, and React-Leaflet**.

This project replaces legacy static PDF campus maps with a **public-facing, keyboard-operable, screen-reader-friendly wayfinding experience**.

It is intentionally designed as a **bridge solution for DOJ ADA Title II WCAG 2.1 AA compliance readiness ahead of April 24, 2026**, and is **separate from the College’s longer-term enterprise wayfinding initiative**.

---

# 🎯 Project Purpose

The map is designed for **public destination discovery and accessible arrival support**, not facilities inventory replication.

## Primary goals

- accessible building discovery
- parking and entrance wayfinding
- student services discovery
- landmark and destination search
- campus-specific accessibility guidance
- text alternatives for all mapped destinations
- public bridge wayfinding across KCC campuses

## Explicitly out of scope

This project is **not intended to recreate**:

- every classroom
- internal room inventories
- closet / facilities references
- maintenance-only locations
- long-term enterprise indoor navigation

The product direction is **destination-first public wayfinding**.

---

# 🛠️ Tech Stack

- **React 19**
- **Vite**
- **Leaflet**
- **React-Leaflet**
- **Vanilla CSS**
- **Lucide React**
- **Framer Motion** (marker polish + animation support)

---

# 🧱 Architecture

The project is fully modularized and should remain modular.

## Current major modules

- `src/AccessibleCampusMap.jsx`
- `src/components/Controls.jsx`
- `src/components/DirectoryFlyTo.jsx`
- `src/components/FeatureEditor.jsx`
- `src/components/PopupArrival.jsx`
- `src/components/PopupResources.jsx`
- `src/components/Announcer.jsx`
- `src/data/mapData.js`
- `src/utils/mapIcons.js`
- `src/utils/mapUtils.js`
- `src/map.css`

## Architectural principles

- destination-first interaction model
- single unified focus/open pipeline
- modular popup sections
- data-shaped directory rendering
- campus image overlay precision via Simple CRS
- no Tailwind or framework styling abstractions
- accessibility-first keyboard and text alternatives

---

# 🚀 Current Viewer Experience

## ✔ Map interaction

- static image-overlay map using **Leaflet Simple CRS**
- pan via drag or keyboard arrows
- zoom controls and keyboard zoom
- Home key centers current view
- End key fits full campus bounds
- selected marker animation and visual emphasis

## ✔ Unified destination state model

All entry paths now share the same behavior:

- marker click
- directory click
- search result selection

Each action synchronizes:

- selected marker visual state
- popup open state
- directory highlighted item
- active destination summary line
- screen-reader announcement
- map focus shell

This keeps the interaction model cognitively simple and highly predictable.

## ✔ Destination-first ranked search

The search system now supports a richer wayfinding flow.

### Search matches across

- building names
- descriptions
- categories
- marker glyphs
- arrival guidance
- popup service links
- resource notes

### Search behavior

- destination-ranked best matches
- compact preview mode
- expandable **Show all results** state
- collapses after destination selection
- preserves selected destination context
- abandoning search returns to browse mode cleanly
- directory or marker click clears transient search state
- active summary line persists until the map context changes

## ✔ Dynamic directory rendering

The directory is now **content-aware**.

### Viewer mode

- only renders accordion sections that contain data
- hides empty categories automatically
- keeps browsing concise
- reduces dead UI regions

This is especially important for:

- future campus-specific datasets
- reduced cognitive load
- stronger accessibility scanning

## ✔ Popup content model

Popup structure is now standardized.

### Popup sections

- title
- optional image
- description
- **Arrival & Access**
- **Available Services & Resources**
- footer CTA zone

This separation improves:

- readability
- screen-reader reading order
- service discoverability
- future structured editing

---

# ✍️ Editor Mode (`?edit=true`)

Editor mode is designed for safe map refinement without changing source code directly.

## Current capabilities

- add markers
- drag markers
- edit metadata
- export JSON
- download CSV
- import CSV
- edit popup images
- edit glyphs
- edit arrival guidance
- edit structured resources

## Editor directory behavior

Unlike viewer mode, editor mode may expose empty categories so future destinations can be added intentionally.

This preserves taxonomy visibility while authoring.

## Current editable fields

- `id`
- `name`
- `xy`
- `desc`
- `category`
- `glyph`
- `url`
- `img`
- `imgAlt`
- `arrival`
- `resources`

---

# 📦 Feature Data Model

Each destination supports structured metadata.

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

---

# 🖼️ Map Coordinate Model

The map uses a **static high-resolution image overlay**, not GIS coordinates.

```text
public/maps/kcc-campus.png
```

All coordinates use image pixel positioning:

```js
xy: [y, x]
```

This allows:

- exact placement over designed campus artwork
- predictable popup positioning
- easier multi-campus portability
- strong keyboard control compatibility

---

# 🧭 Accessibility Model (WCAG 2.1 AA)

Accessibility is a first-order architecture decision.

## Keyboard support

| Action | Key |
|---|---|
| Pan | Arrow keys |
| Zoom in | `+` or `=` |
| Zoom out | `-` |
| Center current context | `Home` |
| Fit campus bounds | `End` |
| Open directory item | `Enter` |
| Skip to map | Skip link |
| Skip to directory | Skip link |

## Accessibility patterns implemented

- WCAG 2.1 AA visible focus states
- keyboard-operable map shell
- skip links to map and directory
- `aria-live` announcements
- grouped directory as text alternative
- structured popup reading order
- text-equivalent arrival guidance
- no pointer-only dependency
- active destination breadcrumb summary
- reduced empty UI in browse mode
- mobile-safe popup reading flow

---

# 🗺️ Product Direction

## Current refinement priorities

- standardize arrival/access data for key public buildings
- continue popup spacing and visual rhythm polish
- expand structured editor support
- support multiple campus datasets
  - Main
  - Riverfront
  - SEC
  - MITC
- continue destination-first search simplification
- clean parking and entrance data quality

---

# 📌 Product Positioning

Compared with many higher-ed map experiences, this implementation prioritizes:

- lower cognitive load
- fewer control metaphors
- stronger keyboard parity
- simpler public-facing wayfinding
- faster destination acquisition
- better text alternative coverage

The result is intentionally optimized for **public accessibility, compliance, and cognitive simplicity over GIS-style control complexity**.

---

# ✅ Non-Negotiables

- WCAG 2.1 AA compliance
- unified popup behavior
- selected marker + directory sync
- popup section separation
- dynamic viewer directory sections
- editor taxonomy visibility
- no Tailwind
- preserve working features unless intentionally redesigning

