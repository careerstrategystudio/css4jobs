// Server-only — import only from API routes
import { createHmac, randomUUID } from 'crypto';

const getSecret = () => process.env.KEY_SECRET || 'css4jobs-default-secret-change-me';

export interface KeyPayload {
  id: string;      // unique per key — prevents duplicate detection
  email: string;   // ties key to one customer
  limit: number;   // CVs allowed per month
  exp: string;     // ISO expiry date
}

function enc(s: string) { return Buffer.from(s).toString('base64url'); }
function dec(s: string) { return Buffer.from(s, 'base64url').toString(); }
function sign(encoded: string) {
  return createHmac('sha256', getSecret()).update(encoded).digest('hex').slice(0, 16);
}

export function generateKey(email: string, limitCVs: number, months: number): string {
  const exp = new Date();
  exp.setMonth(exp.getMonth() + months);
  const payload: KeyPayload = {
    id:    randomUUID(),
    email: email.toLowerCase().trim(),
    limit: limitCVs,
    exp:   exp.toISOString(),
  };
  const encoded = enc(JSON.stringify(payload));
  return `CSS4J.${encoded}.${sign(encoded)}`;
}

export function verifyKey(
  key: string, email: string
): { valid: true; payload: KeyPayload } | { valid: false; error: string } {
  const parts = key.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'CSS4J')
    return { valid: false, error: 'Formato de clave inválido' };

  const [, encoded, sig] = parts;
  if (sign(encoded) !== sig)
    return { valid: false, error: 'Firma inválida — clave modificada o incorrecta' };

  let payload: KeyPayload;
  try { payload = JSON.parse(dec(encoded)); }
  catch { return { valid: false, error: 'Datos de clave corruptos' }; }

  if (new Date(payload.exp) < new Date())
    return { valid: false, error: 'Clave expirada — contacta a Javier para renovar' };

  if (payload.email !== email.toLowerCase().trim())
    return { valid: false, error: 'El email no coincide con esta clave' };

  return { valid: true, payload };
}
