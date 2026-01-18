## 2025-02-18 - Browser-Like UI Controls Accessibility
**Learning:** The application uses a "browser-in-browser" metaphor (PodGrid) which creates many icon-only controls (back, forward, refresh, new tab) that are purely visual. These often get implemented as divs or buttons without text, making them invisible to screen readers.
**Action:** When implementing "fake" browser or OS controls, always explicitly map them to standard ARIA labels (e.g., "Go Back", "Refresh") and ensure they are semantic <button> elements, not clickable <div>s.
