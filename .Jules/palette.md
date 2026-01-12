# Palette's Journal

## 2026-01-12 - Loading State UX
**Learning:** Preventing UI flicker on async actions (like API calls) is critical for perceived stability. Even fast actions need a minimum display time for loading states (e.g., 800ms) so users can register the state change.
**Action:** Use `Promise.all([apiCall, minDelay])` pattern for future async buttons.
