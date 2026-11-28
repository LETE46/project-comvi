// เก็บ idToken ไว้ให้ lib/api.ts ใช้ (api ไม่ใช่ React จึงอ่าน context ตรง ๆ ไม่ได้)
// LiffProvider เป็นคนเรียก setAuth เมื่อ LIFF พร้อมแล้ว

let idToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

let resolveReady: () => void = () => {};
const ready = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

// ครั้งเดียว LIFF ini
export function setAuth(token: string | null, handler?: () => void) {
  idToken = token;
  onUnauthorized = handler ?? null;
  resolveReady();
}

// request ต้องรอ LIFF ก่อน ไม่งั้นจะยิงแบบไปโดยยังไม่มี token
export const waitForAuth = () => ready;
export const getIdToken = () => idToken;
export const handleUnauthorized = () => onUnauthorized?.();