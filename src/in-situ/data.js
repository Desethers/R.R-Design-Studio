// Editorial content and assets already present in the In Situ concept.
// Unknown dates, dimensions and biographies are deliberately left unset.
export const homeUrl = '/in-situ-fabienne-leclerc.html';
export const officialUrl = 'https://www.insituparis.fr/';
export const artistUrl = id => `${homeUrl}?artist=${encodeURIComponent(id)}`;
export const exhibitionUrl = id => `${homeUrl}?exhibition=${encodeURIComponent(id)}`;
const asset = name => `/images/in-situ/${name}.webp`;

export const exhibitions = [
  { id: 'ergriffenheit', title: 'L’« Ergriffenheit »', artist: 'Patrick Van Caeckenbergh', artistId: 'patrick-van-caeckenbergh', date: '13.09 — 31.10.2026', label: 'Exposition', official: "https://www.insituparis.fr/fr/expositions/presentation/220/L'«%20Ergriffenheit%20»", images: [{ src: asset('hero'), width: 2600, height: 1825, alt: 'L’Ergriffenheit, image de l’exposition de Patrick Van Caeckenbergh', caption: 'L’« Ergriffenheit »' }] },
  { id: 'embracing-grounds', title: 'Embracing Grounds', artist: 'Otobong Nkanga', artistId: 'otobong-nkanga', date: '2026', place: 'Grand Paris', label: 'Exposition', images: [{ src: asset('nkanga'), width: 1400, height: 933, alt: 'Vue d’exposition avec une œuvre textile d’Otobong Nkanga', caption: 'Vue d’exposition' }] },
  { id: 'flame-dust', title: 'Flame, dust only for the wind', artist: 'Beau Disundi', artistId: 'beau-disundi', date: '2025', label: 'Œuvres', images: [{ src: asset('disundi-a'), width: 1168, height: 1750, alt: 'Œuvre sur papier de Beau Disundi', caption: 'Œuvre sur papier' }, { src: asset('disundi-b'), width: 934, height: 1400, alt: 'Œuvre de Beau Disundi', caption: 'Œuvre de Beau Disundi' }] },
  { id: 'edge-of-land', title: 'At the Edge of Land', artist: 'Daniele Genadry', artistId: 'daniele-genadry', label: 'Vue d’exposition', images: [{ src: asset('genadry-a'), width: 1800, height: 1200, alt: 'Vue d’exposition de Daniele Genadry', caption: 'Vue d’exposition' }, { src: asset('genadry-b'), width: 1400, height: 1050, alt: 'Œuvre aux tonalités roses de Daniele Genadry', caption: 'Œuvre de Daniele Genadry' }] },
  { id: 'remembering-the-light', title: 'Remembering the Light', artist: 'Joana Hadjithomas & Khalil Joreige', artistId: 'hadjithomas-joreige', date: '2025', place: 'Sursock Museum', label: 'Exposition', images: [{ src: asset('joana-a'), width: 1400, height: 933, alt: 'Vue de l’exposition Remembering the Light de Joana Hadjithomas et Khalil Joreige', caption: 'Vue d’exposition' }, { src: asset('joana-b'), width: 1400, height: 1322, alt: 'Vue de l’exposition de Joana Hadjithomas et Khalil Joreige', caption: 'Vue d’exposition' }] },
];

export const artists = [
  { id: 'mark-dion', name: 'Mark Dion', letter: 'D', official: 'https://www.insituparis.fr/fr/artistes/presentation/1591/dion-mark' },
  { id: 'beau-disundi', name: 'Beau Disundi', letter: 'D', exhibition: 'flame-dust', official: 'https://www.insituparis.fr/fr/artistes/presentation/12544/disundi-beau' },
  { id: 'daniele-genadry', name: 'Daniele Genadry', letter: 'G', exhibition: 'edge-of-land', official: 'https://www.insituparis.fr/fr/artistes/presentation/10529/genadry-daniele' },
  { id: 'hadjithomas-joreige', name: 'Joana Hadjithomas & Khalil Joreige', letter: 'H', exhibition: 'remembering-the-light', official: 'https://www.insituparis.fr/fr/artistes/presentation/5378/hadjithomas-khalil-joreige-joana' },
  { id: 'otobong-nkanga', name: 'Otobong Nkanga', letter: 'N', exhibition: 'embracing-grounds', official: 'https://www.insituparis.fr/fr/artistes/presentation/7766/nkanga-otobong' },
  { id: 'patrick-van-caeckenbergh', name: 'Patrick Van Caeckenbergh', letter: 'V', exhibition: 'ergriffenheit', official: 'https://www.insituparis.fr/fr/artistes/presentation/4982/van-caeckenbergh-patrick' },
];

export const news = [
  { date: '09.05 — 22.11', title: 'Otobong Nkanga', place: 'Biennale Arte 2026 · Venise', artistId: 'otobong-nkanga' },
  { date: '09.05 — 22.11', title: 'Joana Hadjithomas & Khalil Joreige', place: 'Biennale Arte 2026 · Venise', artistId: 'hadjithomas-joreige' },
  { date: '23.03 — 07.07', title: 'Shifting Crossroads', place: 'Beirut Contemporary · Milan' },
];
