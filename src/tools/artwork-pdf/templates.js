export const layouts = [
  { id:'editorial', name:'Editorial', description:'One artwork per page. Room to look.', perPage:1, columns:1 },
  { id:'pair', name:'Paired', description:'Two artworks, one conversation.', perPage:2, columns:1 },
  { id:'contact', name:'Contact sheet', description:'Four artworks. A concise overview.', perPage:4, columns:2 },
];
export const labels = {
  en:{ selection:'Selected works', price:'Price', continued:'Details continued', noImage:'Image unavailable', works:'artworks' },
  fr:{ selection:'Sélection d’œuvres', price:'Prix', continued:'Suite des informations', noImage:'Image indisponible', works:'œuvres' },
};
export function layoutFor(id) { return layouts.find(l=>l.id===id) || layouts[0]; }
