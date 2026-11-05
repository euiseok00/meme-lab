export const MAX_LEN = 40

// UTF-8 → base64url, so Korean text stays short and URL-safe.
export function encodeMessage(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// URL is untrusted input: return null on garbage, cap length.
export function decodeMessage(param: string | null): string | null {
  if (!param) return null
  try {
    const bin = atob(param.replace(/-/g, '+').replace(/_/g, '/'))
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, c => c.charCodeAt(0)))
    const trimmed = Array.from(text.trim()).slice(0, MAX_LEN).join('')
    return trimmed || null
  } catch {
    return null
  }
}
