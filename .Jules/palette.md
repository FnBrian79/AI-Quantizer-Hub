## 2024-05-23 - Semantic Buttons vs Clickable Divs
**Learning:** `PodGrid` used clickable `div`s for actions, breaking keyboard nav and screen reader support.
**Action:** systematically scan for `onClick` on `div`/`span` and convert to `<button>` with `aria-label` for icon-only variants.
