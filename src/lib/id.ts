import { customAlphabet } from 'nanoid';

// URL-safe, unambiguous, unguessable id.
const alphabet = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
export const newGreetingId = customAlphabet(alphabet, 10);
