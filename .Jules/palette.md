## 2025-05-15 - Interactive Divs vs Semantic Buttons
**Learning:** Interactive elements implemented as `div`s (like the "New Tab" icon) are inaccessible to keyboard users and screen readers, creating a "dead zone" in the interface.
**Action:** Systematically convert these to `<button>` elements with `aria-label`s and visible focus rings (`focus:ring`) to restore functionality for all users.
