## 2025-05-13 - Widespread Icon-Only Buttons
**Learning:** The application heavily relies on icon-only buttons for critical actions (close, sync, navigate) but consistently lacks `aria-label` attributes, making them inaccessible to screen reader users. Additionally, some interactive elements are implemented as non-semantic `div`s.
**Action:** When creating icon-only buttons, always mandate `aria-label` and use semantic `<button>` elements. Review existing components for this pattern.
