import { createHash } from 'crypto';

// ตัวตนผู้เล่น: client เก็บ secret ลับไว้เอง (ไม่ส่งให้ใคร) ส่วน userId สาธารณะคำนวณจาก secret ที่ server
// ทำให้การรู้ userId ของคนอื่น (ซึ่งเห็นได้ใน state / แชท) ไม่พอจะปลอมตัวเป็นเขา
const PLAYER_SECRET_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PLAYER_ID_LENGTH = 16;

// secret ต้องเป็น uuid v4 (client สร้างด้วย uuidv4())
export const isValidPlayerSecret = (secret: unknown): secret is string =>
  typeof secret === 'string' && PLAYER_SECRET_PATTERN.test(secret);

// secret เดิมได้ userId เดิมเสมอ (ใช้กับ reconnect) และย้อนจาก userId กลับเป็น secret ไม่ได้
export const derivePlayerId = (secret: string): string =>
  createHash('sha256').update(secret).digest('base64url').slice(0, PLAYER_ID_LENGTH);
