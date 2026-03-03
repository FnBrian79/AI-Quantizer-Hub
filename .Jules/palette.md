## 2024-05-23 - [Interactive Elements Must Be Buttons]
**Learning:** Using `div` with `onClick` for interactive elements (like the "Add" icon) creates accessibility barriers, as they lack keyboard focus and semantic roles.
**Action:** always use `<button>` elements for interactive triggers, even for icon-only interfaces, ensuring they are keyboard accessible and properly labeled.
