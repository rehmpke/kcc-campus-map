# 🗺️ KCC Campus Map (Accessible Interactive Map)

An accessible, WCAG 2.1 AA–compliant interactive campus map for Kankakee Community College built with **React**, **Vite**, **Leaflet**, and **React-Leaflet**.

This project replaces the static PDF campus map with an interactive, keyboard-navigable, screen-reader-friendly experience. It supports category-specific icons, directory search, keyboard panning/zooming, and an admin editor mode for managing map points.

---

## 🛠️ Tech Stack
This project is built using:
- **React** (UI framework)
- **Vite** (lightning-fast dev server + bundler)
- **Leaflet** & **React-Leaflet** (interactive mapping)
- **Vanilla CSS** (WCAG-focused custom styles)

### Documentation & Support
- React: https://react.dev/
- Vite: https://vitejs.dev/guide/
- Leaflet: https://leafletjs.com/
- React-Leaflet: https://react-leaflet.js.org/

---

## 🚀 Features

### ✔ Viewer Mode (Default)
- Fully accessible to screen readers  
- Tab/Shift+Tab navigate all controls  
- Arrow keys pan the map  
- `+` / `-` zoom the map  
- Directory instantly focuses any building/landmark  
- High-contrast controls and visible focus rings  
- Compatible with mobile and desktop

### ✔ Editor Mode (For Staff)
Enable via URL:

```
?edit=true
```

Editor mode allows staff to:
- Drag markers to reposition  
- Update:
  - Name  
  - Description  
  - Category  
  - Facility detail URL  
  - Image URL  
  - Image ALT text  
- Add new points  
- Export JSON  
- Export CSV  
- Import CSV  

Changes must be saved manually:  
Use **Export JSON**, then paste into `INITIAL_FEATURES` inside `AccessibleCampusMap.jsx`.

---

## 🖼️ Map Image

The map uses a high-resolution static PNG stored at:

```
public/maps/kcc-campus.png
```

Replace this file to update the visual map.  
Coordinates automatically align with the image size.

---

## 🏷 Categories & Icons

Each point uses a high-contrast, WCAG-friendly icon:

Category | Color | Usage
-------- | ------ | -------
**building** | Indigo | Academic & service buildings
**parking** | Blue | Parking lots
**entrance** | Green | Accessible entrances (ADA)
**landmark** | Orange | Riverfront, pavilion, memorials
**service** | Brown | Bus stops, bike racks, utilities

Icons are inline SVG and fully accessible (no external files required).

---

## 🧭 Keyboard Navigation (WCAG 2.1 AA)

Action | Key
------ | ------
Pan | Arrow keys
Zoom in | `+` or `=`
Zoom out | `-`
Reset center | `Home`
Fit full campus | `End`
Directory → focus selected item | Enter
Skip to map | Tab (skip link)
Skip to directory | Tab (skip link)

---

## 📁 File Structure

```
src/
 ├── App.jsx
 ├── AccessibleCampusMap.jsx
 ├── map.css
public/
 ├── maps/kcc-campus.png
 └── images/map/...
```

---

## 💾 CSV Import/Export

Supported fields:

| Column | Description |
|--------|-------------|
| `id` | Unique identifier |
| `name` | Building/feature name |
| `category` | building, parking, entrance, landmark, service |
| `desc` | Accessible description |
| `y` / `x` | Pixel coordinates |
| `url` | Optional facility page link |
| `img` | Optional image URL |
| `imgAlt` | Required if image is used |

CSV import replaces all existing points.

---

## 🛠️ Development

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

Local dev URL:  
`http://localhost:5173/`

---

## 🏗️ Production Build

```bash
npm run build
```

Deploy the `dist/` folder to:
- KCC web server  
- CloudCannon  
- AWS S3 / CloudFront  
- Any static host

---

## 🔒 Accessibility

The map meets WCAG 2.1 AA standards:

- Keyboard operable  
- Logical tab order  
- No information conveyed by color alone  
- High-contrast UI  
- Screen-reader announcements (ARIA live regions)  
- Accessible forms and controls  
- Text equivalents for all meaningful images  
- No pointer-only interactions  
- No motion/time-based requirements

---

## 📌 Roadmap
- Layer toggles (Buildings / Parking / Entrances / Landmarks)  
- Mobile bottom drawer interface  
- Analytics for most-viewed buildings  
- CMS/Facilities integration  

---

## 👤 Author

**Roger J. Ehmpke**  
Director of Web Strategy and Digital Experience
Kankakee Community College  
