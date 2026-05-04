import crypto from "crypto";

/**
 * Generate a cryptographically random Base32 secret for TOTP.
 */
export function generateSecret(length = 20): string {
  const bytes = crypto.randomBytes(length);
  // Base32 encode
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  let bits = 0;
  let value = 0;
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += alphabet[(value >>> bits) & 31];
    }
  }
  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 31];
  }
  return result;
}

/**
 * Decode a Base32 string to a Buffer.
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const result: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of cleaned) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      result.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(result);
}

/**
 * Generate a TOTP token for the given secret at the current time.
 */
export function generateTOTP(secret: string, timeStep = 30, digits = 6): string {
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const secretBuffer = base32Decode(secret);
  const hmac = crypto
    .createHmac("sha1", secretBuffer)
    .update(counterBuffer)
    .digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 10 ** digits).padStart(digits, "0");
}

/**
 * Verify a TOTP token against a secret (with ±1 time step tolerance).
 */
export function verifyTOTP(token: string, secret: string, timeStep = 30, digits = 6): boolean {
  // Try current, previous, and next time steps (±30s tolerance)
  const now = Math.floor(Date.now() / 1000);
  for (let offset = -1; offset <= 1; offset++) {
    const counter = Math.floor((now + offset * timeStep) / timeStep);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter));

    const secretBuffer = base32Decode(secret);
    const hmac = crypto
      .createHmac("sha1", secretBuffer)
      .update(counterBuffer)
      .digest();

    const off = hmac[hmac.length - 1] & 0x0f;
    const code =
      ((hmac[off] & 0x7f) << 24) |
      ((hmac[off + 1] & 0xff) << 16) |
      ((hmac[off + 2] & 0xff) << 8) |
      (hmac[off + 3] & 0xff);

    const expected = String(code % 10 ** digits).padStart(digits, "0");
    if (token === expected) return true;
  }
  return false;
}

/**
 * Build an otpauth:// URI for QR code generation.
 */
export function buildOTPAuthURI(secret: string, label: string, issuer = "Shepherd AI"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedLabel = encodeURIComponent(label);
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
