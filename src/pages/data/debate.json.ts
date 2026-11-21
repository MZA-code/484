/** /data/debate.json : toutes les données du jeu, générées au build (fichier statique). */
import type { APIRoute } from 'astro';
import { buildDebateData } from '../../data/debate-data';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildDebateData()), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
