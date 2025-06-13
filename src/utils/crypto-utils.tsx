export async function signDigest(digestBase64: string, privateKeyPem: string) {
  const cryptoKey = await window.crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Uint8Array.from(atob(digestBase64), (c) => c.charCodeAt(0))
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buf;
}
