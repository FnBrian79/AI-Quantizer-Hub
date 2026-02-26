## 2024-10-25 - Missing ARIA Labels on Icon Buttons
**Learning:** This application heavily relies on icon-only buttons (using lucide-react) for its "futuristic/cyberpunk" dashboard aesthetic, but consistently lacks `aria-label` attributes, making it inaccessible to screen readers.
**Action:** When adding or modifying icon-only buttons, always ensure an `aria-label` and `title` (for tooltip) are present.
