/** Image de partage : dimensions et adresse (celle d'un débat, ou l'image générale du site). */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const SITE_IMAGE_ID = 'site';

export function ogImagePath(rivalryId: string = SITE_IMAGE_ID): string {
  return `/og/${rivalryId}.png`;
}
