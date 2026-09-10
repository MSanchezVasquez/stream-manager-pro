const PBKDF2_ITERATIONS = 210_000; // recomendación OWASP 2023+

// ============================================================
// HELPERS DE CONVERSIÓN
// ============================================================

function bufToBase64(buf: ArrayBuffer | ArrayBufferLike): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf as ArrayBuffer)));
}

function base64ToBuf(b64: string): ArrayBuffer {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

/**
 * Nota sobre los casts `as BufferSource` / `as ArrayBuffer` en este archivo:
 * En versiones recientes de TypeScript, `Uint8Array.buffer` se tipa como
 * `ArrayBufferLike` (que incluye `SharedArrayBuffer`), pero las firmas de
 * la Web Crypto API (`crypto.subtle.*`) exigen `ArrayBuffer` puro o
 * `BufferSource`. En este archivo NUNCA usamos `SharedArrayBuffer` (todos
 * los buffers se crean localmente con `new Uint8Array(...)` o
 * `crypto.getRandomValues`), así que el cast es seguro en tiempo de
 * ejecución; solo silencia una discrepancia de tipos demasiado estricta.
 */

// ============================================================
// DERIVACIÓN DE CLAVE (PBKDF2 -> AES-GCM)
// ============================================================

/**
 * Deriva una clave AES-GCM a partir de la passphrase del usuario + un salt.
 * El salt NO es secreto (se puede guardar en Firestore), solo evita
 * ataques de rainbow table entre distintos usuarios.
 */
async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase) as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // no extraíble: no se puede volcar la clave cruda
    ["encrypt", "decrypt"],
  );
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

export function saltToBase64(salt: Uint8Array): string {
  return bufToBase64(salt.buffer);
}

export function saltFromBase64(b64: string): Uint8Array {
  return new Uint8Array(base64ToBuf(b64));
}

// ============================================================
// CIFRADO / DESCIFRADO DE TEXTO
// ============================================================

/**
 * Cifra un texto plano. El resultado incluye el IV (no secreto, va con
 * el ciphertext) codificado junto, separado por ":".
 */
export async function encryptText(
  plaintext: string,
  key: CryptoKey,
): Promise<string> {
  if (!plaintext) return "";
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    enc.encode(plaintext) as BufferSource,
  );

  return `${bufToBase64(iv.buffer)}:${bufToBase64(ciphertext)}`;
}

export async function decryptText(
  payload: string,
  key: CryptoKey,
): Promise<string> {
  if (!payload || !payload.includes(":")) return payload; // dato legado sin cifrar
  try {
    const [ivB64, ctB64] = payload.split(":");
    const iv = new Uint8Array(base64ToBuf(ivB64));
    const ciphertext = base64ToBuf(ctB64);

    const plaintextBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(plaintextBuf);
  } catch (err) {
    console.error("Error al descifrar (¿passphrase incorrecta?):", err);
    throw new Error("VAULT_DECRYPT_FAILED");
  }
}

// ============================================================
// DETECCIÓN DE PAYLOAD CIFRADO
// ============================================================

/**
 * Determina si un string tiene la forma "iv:ciphertext" (ambos en base64)
 * generada por encryptText, para diferenciar datos ya cifrados de datos
 * legados en texto plano.
 */
export function isEncryptedPayload(value: string): boolean {
  if (!value || !value.includes(":")) return false;
  const parts = value.split(":");
  if (parts.length !== 2) return false;

  const [ivPart, ctPart] = parts;
  const b64Regex = /^[A-Za-z0-9+/]+=*$/;

  // El IV cifrado en base64 (12 bytes) siempre produce 16 caracteres.
  return (
    ivPart.length === 16 &&
    b64Regex.test(ivPart) &&
    ctPart.length > 0 &&
    b64Regex.test(ctPart)
  );
}

export { deriveKey };
