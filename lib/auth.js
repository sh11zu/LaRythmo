// lib/auth.js
// Utilitaires d'authentification partagés

import { cookies } from 'next/headers';

/**
 * Décode un token de session base64 et retourne le payload, ou null si invalide.
 */
export function decodeAuthToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * Lit et décode le cookie auth_token depuis la requête courante.
 * Retourne le payload ou null.
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  return decodeAuthToken(token);
}