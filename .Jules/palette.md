## 2025-05-15 - Icon-Only Button Accessibility Pattern
**Learning:** The application heavily relies on icon-only buttons for critical controls (navigation, closing pods, settings) but consistently lacks `aria-label` attributes, making the interface opaque to screen reader users.
**Action:** Standardize a review step for all icon-only interactive elements to ensure they possess descriptive `aria-label` or `aria-labelledby` attributes.
