import type { APIRoute } from 'astro';
import { validateGreetingInput } from '../../lib/greeting';
import { getGreetingsCollection } from '../../lib/mongo';
import { newGreetingId } from '../../lib/id';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, url }) => {
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'גוף הבקשה אינו תקין' }, 400);
  }

  const { ok, errors, value } = validateGreetingInput(raw);
  if (!ok) return json({ errors }, 400);

  let id = newGreetingId();
  try {
    const col = await getGreetingsCollection();
    // extremely unlikely collision, but retry once
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await col.insertOne({
          _id: id,
          holiday: value.holiday,
          fromNames: value.fromNames,
          toNames: value.toNames,
          message: value.message,
          createdAt: new Date(),
        });
        break;
      } catch (e: any) {
        if (e?.code === 11000 && attempt === 0) {
          id = newGreetingId();
          continue;
        }
        throw e;
      }
    }
  } catch (e) {
    console.error('[api/greetings] insert failed', e);
    return json({ error: 'שמירת הברכה נכשלה. נסו שוב בעוד רגע.' }, 500);
  }

  const shareUrl = new URL(`/g/${id}`, url.origin).href;
  return json({ id, url: shareUrl }, 201);
};

export const GET: APIRoute = () => json({ error: 'Method Not Allowed' }, 405);
