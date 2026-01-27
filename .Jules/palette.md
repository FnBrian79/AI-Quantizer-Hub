## 2026-01-27 - Semantic Elements and Accessible Icons
**Learning:** The application heavily utilizes dense, icon-only UI patterns which often lack `aria-label` attributes, rendering them invisible to screen readers. Additionally, interactive elements were found implemented as `div` tags, breaking keyboard focus and navigation.
**Action:** When identifying icon-only buttons, always enforce the addition of `aria-label` and convert any interactive `div` wrappers to semantic `<button>` elements to ensure full accessibility.
