const fields = ['artist', 'title', 'year', 'medium', 'dimensions', 'price'];
export const clients = {
  studio: { id: 'studio', galleryName: 'R.R Gallery', logo: '', typography: 'sans', language: 'en', artworkFields: fields, defaultLayout: 'editorial', showPrices: false },
  atelier: { id: 'atelier', galleryName: 'Atelier Éditions', logo: '', typography: 'serif', language: 'fr', artworkFields: fields, defaultLayout: 'pair', showPrices: true },
};
export function getClient(id = 'studio') {
  if (!Object.hasOwn(clients, id)) throw new Error(`Unknown client “${id}”. Use ?client=studio or ?client=atelier.`);
  return structuredClone(clients[id]);
}
