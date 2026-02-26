## 2024-05-23 - [Icon-Only Buttons & Accessibility]
**Learning:** Dense dashboards often use icon-only buttons to save space, but without accessible labels, they become unusable for screen reader users and confusing for everyone else.
**Action:** Always enforce a pattern where icon-only components accept an `aria-label` or `title` prop, and ensure even "div-buttons" are converted to semantic `<button>` elements.
