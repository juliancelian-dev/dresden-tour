import { PHOTO_CHECK } from './config'

/**
 * Prepared for later: an AI checks whether a photo shows what the task asks for.
 *
 * How to switch it on once there is an OpenRouter (or similar) key:
 * 1. Store the key as a Supabase secret, e.g. OPENROUTER_API_KEY. Never in the app code.
 * 2. Deploy an edge function "photo-check" that receives { task, image } and
 *    returns { ok: boolean, reason: string }.
 * 3. Set PHOTO_CHECK to 'ai' in config.ts and call checkPhoto from the task card.
 *
 * Until then the group decides, which is what the app does by default.
 */
export type PhotoVerdict = { ok: boolean; reason: string }

export async function checkPhoto(_taskPrompt: string, _image: Blob): Promise<PhotoVerdict> {
  if (PHOTO_CHECK !== 'ai') throw new Error('Fotoprüfung per KI ist noch nicht eingerichtet.')
  throw new Error('Die Supabase-Funktion photo-check fehlt noch.')
}
