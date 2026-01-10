## 2026-01-10 - Missing Async Feedback on Core Actions
**Learning:** The "Global Synthesis" action involves an external API call (Google GenAI) but lacks any immediate visual feedback on the button itself. Users rely on a log message which appears elsewhere, leading to potential confusion or double-clicking.
**Action:** Always wrap async API calls with a local loading state that disables the trigger button and provides visual feedback (spinner/text change) directly on the element the user interacted with.
