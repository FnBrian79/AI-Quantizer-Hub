## 2026-01-13 - Icon-Only Buttons Accessibility
**Learning:** Complex "futuristic" UIs often rely heavily on icon-only controls for aesthetics, which severely impacts accessibility if ARIA labels are neglected.
**Action:** When auditing sci-fi/dashboard interfaces, prioritize scanning for icon-only elements (`<X />`, `<ChevronRight />`, etc.) and ensure they have descriptive `aria-label` attributes.
