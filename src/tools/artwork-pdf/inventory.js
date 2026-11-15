export const headers = ['artist','title','year','medium','dimensions','price','image'];
export function parseInventory(text, parser = globalThis.Papa) {
  const result = parser.parse(text.replace(/^\uFEFF/, ''), { header:true, skipEmptyLines:'greedy', transformHeader:h=>h.trim().toLowerCase() });
  if (result.errors.some(e=>e.code !== 'UndetectableDelimiter')) throw new Error(`CSV: ${result.errors[0].message}. Check quoted values and column counts.`);
  if (!['artist','title'].every(h=>result.meta.fields?.includes(h))) throw new Error('CSV needs artist and title columns. Download the sample CSV for the expected format.');
  if (!result.data.length) throw new Error('The CSV contains no artworks.');
  if (result.data.length > 1000) throw new Error('Import up to 1,000 artworks at a time.');
  return result.data.map((row,i)=>{
    if (!row.artist?.trim() || !row.title?.trim()) throw new Error(`Row ${i+2}: artist and title are required. No records were replaced.`);
    const item = Object.fromEntries(Object.keys(row).map(h=>[h,String(row[h] || '').trim()]));
    return { ...item, id:`import-${i}`, image: safeImage(item.image) };
  });
}
export function safeImage(value) {
  if (!value) return '';
  if (/^(javascript|data|blob|file):/i.test(value) || value.startsWith('//')) throw new Error('CSV image values must be an image filename, a local path, or an http(s) URL.');
  return value;
}
export function filterArtworks(items, query) {
  const normalize=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const terms=normalize(query).split(/\s+/).filter(Boolean);
  return items.filter(item=>terms.every(term=>normalize(headers.map(h=>item[h]).join(' ')).includes(term)));
}
export function sampleCSV(items, parser = globalThis.Papa) {
  return parser.unparse(items.map(item=>Object.fromEntries(headers.map(h=>[h,item[h] || '']))), {escapeFormulae:true});
}
