## 2026-01-24 - Icon-Only Button Accessibility Pattern
**Learning:** This codebase heavily utilizes icon-only buttons for density, but consistently lacked `aria-label` attributes, making the interface opaque to screen readers.
**Action:** When adding new icon buttons, strictly enforce the inclusion of `aria-label`. Use the tooltip text or a descriptive action name as the label value.
