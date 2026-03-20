const IV_LENGTH = 12;

export interface EncryptedPayload {
  iv: Uint8Array;
  ciphertext: ArrayBuffer;
}

export async function encrypt(
  key: CryptoKey,
  data: BufferSource
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return { iv, ciphertext };
}

export async function encryptText(
  key: CryptoKey,
  text: string
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  return encrypt(key, encoder.encode(text));
}

export function packEncrypted(payload: EncryptedPayload): ArrayBuffer {
  const packed = new Uint8Array(payload.iv.length + payload.ciphertext.byteLength);
  packed.set(payload.iv, 0);
  packed.set(new Uint8Array(payload.ciphertext), payload.iv.length);
  return packed.buffer;
}
