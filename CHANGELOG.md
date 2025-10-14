# Changelog

All notable changes to this project will be documented in this file.

## 2025-10-14

### Added
- Embedded a lightweight map on lecture pages inside the existing "Location" box, plus a "View larger map" link.
  - Implementation: Google Maps search iframe built from venue name, city, and postcode (no API keys or geocoding).
  - File touched: `pages/lecture.html` (HTML injection + minimal CSS).

### Notes
- The institution page map was explored but not merged to keep scope minimal; can be added later using the same pattern.
- If you prefer OpenStreetMap, the iframe `src` can be swapped to an OSM-based embed or Leaflet in a future change.

