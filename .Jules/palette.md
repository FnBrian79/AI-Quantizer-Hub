## 2024-05-22 - Interactive Elements as Divs
**Learning:** Interactive UI elements (like the "New Tab" button in PodGrid) are implemented as `div` tags, preventing keyboard access and screen reader support.
**Action:** Convert interactive `div`s to semantic `<button>` elements and ensure they have accessible names.
