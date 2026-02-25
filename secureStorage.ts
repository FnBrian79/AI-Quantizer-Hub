// secureStorage.ts — AES-GCM 256-bit encrypted localStorage via SubtleCrypto.
// Zero dependencies. Requires "DOM" lib (window.crypto.subtle).

const SECURE_KEY = 'qhub-secure-v2';
const SALT_KEY   = 'qhub-salt-v1';
const LEGACY_KEY = 'quantizer-settings-v1'; // plain-text predecessor

// Source-bound identity — not user-entered, so no password prompt needed.
// Change the suffix to invalidate all stored ciphertext (force key re-entry on version bump).
const APP_SECRET = 'qhub::ai-quantizer-hub::v2-secure-identity';

// ── Helpers ───────────────────────────────────────────────────────────────────

function b64encode(buf: ArrayBuffer): string {
  // btoa + Uint8Array loop is the correct DOM-only base64 path (no Node Buffer).
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64decode(s: string): Uint8Array {
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

// ── Key Derivation ────────────────────────────────────────────────────────────

async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const base = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(APP_SECRET),
    { name: 'PBKDF2' },
    false,          // not extractable — key material stays inside SubtleCrypto
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,          // CryptoKey object cannot be serialised or logged
    ['encrypt', 'decrypt']
  );
}

// Returns the persisted 16-byte salt; generates and saves it on first call.
function getSalt(): Uint8Array {
  const stored = localStorage.getItem(SALT_KEY);
  if (stored) return b64decode(stored);
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, b64encode(salt.buffer));
  return salt;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Encrypt `value` and write to localStorage as { iv, ct } JSON. */
export async function saveSecure<T>(value: T): Promise<void> {
  const salt = getSalt();
  const key  = await deriveKey(salt);
  const iv   = window.crypto.getRandomValues(new Uint8Array(12)); // fresh 96-bit IV per write
  const ct   = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(value))
  );
  localStorage.setItem(SECURE_KEY, JSON.stringify({
    iv: b64encode(iv.buffer),
    ct: b64encode(ct),
  }));
}

/**
 * Decrypt and return the stored value, or `fallback` on any failure.
 * Auto-migrates v1 plain-text entry to encrypted v2 on first run then removes it.
 */
export async function loadSecure<T>(fallback: T): Promise<T> {
  try {
    // Auto-migrate: v1 plain-text exists and v2 encrypted does not yet
    const legacy = localStorage.getItem(LEGACY_KEY);
    const hasV2  = localStorage.getItem(SECURE_KEY) !== null;
    if (legacy && !hasV2) {
      const merged = { ...fallback, ...JSON.parse(legacy) } as T;
      await saveSecure(merged);
      localStorage.removeItem(LEGACY_KEY); // plain-text copy gone
      return merged;
    }

    const raw = localStorage.getItem(SECURE_KEY);
    if (!raw) return fallback;

    const { iv: ivB64, ct: ctB64 } = JSON.parse(raw) as { iv: string; ct: string };
    const pt = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64decode(ivB64) },
      await deriveKey(getSalt()),
      b64decode(ctB64)
    );
    return { ...fallback, ...JSON.parse(new TextDecoder().decode(pt)) } as T;
  } catch {
    // Corrupt data, wrong key, or parse error → safe fallback; user re-enters keys.
    return fallback;
  }
}

/**
 * Wipe encrypted blob + salt from localStorage.
 * Hook for a future "Reset Settings" button — not wired to UI yet.
 */
export function clearSecure(): void {
  localStorage.removeItem(SECURE_KEY);
  localStorage.removeItem(SALT_KEY);
}
