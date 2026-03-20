const IV_LENGTH = 12;

export async function decrypt(
  key: CryptoKey,
  packed: ArrayBuffer
): Promise<ArrayBuffer> {
  const data = new Uint8Array(packed);
  const iv = data.slice(0, IV_LENGTH);
  const ciphertext = data.slice(IV_LENGTH);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
}

export async function decryptText(
  key: CryptoKey,
  packed: ArrayBuffer
): Promise<string> {
  const plaintext = await decrypt(key, packed);
  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}
