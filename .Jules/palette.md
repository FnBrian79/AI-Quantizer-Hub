## 2025-05-18 - Terminal-Style Inputs Accessibility
**Learning:** This app uses stylized inputs (e.g., "Manual Neural Injection") that mimic terminal prompts. These often rely on visual headers as labels but lack programmatic association.
**Action:** Always add descriptive `aria-label` attributes to these terminal-style inputs to match their visual context, as standard `<label>` elements may break the visual design.
