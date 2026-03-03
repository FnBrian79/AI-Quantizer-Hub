## 2026-01-29 - Semantic Buttons for Interactive Elements
**Learning:** Found interactive elements (like the "Plus" icon in PodGrid) implemented as `div` tags with `cursor-pointer` but no keyboard support. This breaks accessibility for keyboard users.
**Action:** Always check interactive elements and ensure they are semantic `<button>` tags with appropriate ARIA labels, especially for icon-only controls.
