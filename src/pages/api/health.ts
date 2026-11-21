import type { APIRoute } from 'astro';

// Route serveur (non pré-rendue) : vérifie que la partie API répond.
export const prerender = false;

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
