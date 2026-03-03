## 2024-05-23 - Accessibility First Steps
**Learning:** This repo has many custom UI components that use icon-only buttons without accessible labels. This is a common pattern in "dashboard" style apps where density is prioritized over accessibility.
**Action:** When creating new components, always enforce `aria-label` for icon-only buttons. I've started this by retrofitting `ControlPanel` and `PodGrid`. Future components should include this in their props interface if possible (e.g. `iconButton({ label: string, ... })`).
