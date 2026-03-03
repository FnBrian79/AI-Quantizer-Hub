## 2026-02-02 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons for a cleaner UI (mock browser chrome, control panels) but consistently neglects accessibility labels, making them invisible to screen readers.
**Action:** Always verify icon-only buttons have `aria-label` attributes during component review.
