import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist/tools');
await mkdir(output,{recursive:true});
const copy=async(source)=>{const dest=path.join(output,source);await mkdir(path.dirname(dest),{recursive:true});await cp(path.join(root,source),dest,{recursive:true});};
for(const file of [
  'tools','src/tools',
  'node_modules/pdf-lib/dist/pdf-lib.min.js',
  'node_modules/@pdf-lib/fontkit/dist/fontkit.umd.min.js',
  'node_modules/papaparse/papaparse.min.js',
  'node_modules/pdfjs-dist/build',
  'images/Pieces/impression-sunrise-monet.jpg',
  'images/Pieces/the-swan-no-10-af-klint.jpg',
  'images/Pieces/composition-no-iv-mondrian.jpg',
  'images/Pieces/boating-manet.jpg',
  'images/Pieces/Matisse-The-Dessert-Harmony-in-Red-Henri-1908-fast.jpg',
  'images/Pieces/Hilma_af_Klint_—_The_Ten_Largest_—_Number_7_Adulthood.jpg',
  'node_modules/pdf-lib/LICENSE.md','node_modules/@pdf-lib/fontkit/package.json','node_modules/@pdf-lib/fontkit/README.md',
  'node_modules/papaparse/LICENSE','node_modules/pdfjs-dist/LICENSE',
]) await copy(file);
await writeFile(path.join(output,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Artwork PDF Generator</title><meta http-equiv="refresh" content="0;url=tools/artwork-pdf/"><a href="tools/artwork-pdf/">Open Artwork PDF Generator</a></html>');
console.log(`Standalone static app prepared at ${output}. Serve this directory over HTTP; open /tools/artwork-pdf/?client=studio.`);
