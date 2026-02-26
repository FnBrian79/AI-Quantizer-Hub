## 2026-02-01 - Icon-Only Buttons Accessibility
**Learning:** The application heavily relies on icon-only buttons for critical actions (sync, remove, navigation) without providing accessible labels. This makes the app unusable for screen reader users and confusing for keyboard users who rely on assistive technology.
**Action:** Always add `aria-label` to icon-only buttons.
