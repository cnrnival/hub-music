/**
 * Hub Music - Password Utilities
 * Utilitários de hash de senha usando crypto nativo do Node.js
 * Password hashing utilities using Node.js native crypto
 * 
 * @languages pt-BR / en-US
 */

import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const COST = 65536; // custo de computação para scrypt

/**
 * Gera hash de senha usando scrypt (nativo do Node.js)
 * Hash password using scrypt (Node.js native)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifica senha contra hash armazenado
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return derivedKey.toString('hex') === key;
}
