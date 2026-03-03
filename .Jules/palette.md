## 2026-01-23 - [Icon-Only Buttons & Cyberpunk Aesthetic]
**Learning:** The application relies heavily on icon-only buttons to maintain a "high-tech/cyberpunk" density (PodGrid, ControlPanel). This creates a systematic accessibility gap where core functionality is invisible to screen readers.
**Action:** When adding new "micro-UI" elements in this design system, standard `aria-label` injection is mandatory, not optional, as the visual design language implicitly discourages text labels.
