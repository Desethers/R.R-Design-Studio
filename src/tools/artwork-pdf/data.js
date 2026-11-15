const image = (file) => new URL(`../../../images/Pieces/${file}`, import.meta.url).href;
export const sampleArtworks = [
  { id:'sample-1',artist:'Claude Monet',title:'Impression, Sunrise',year:'1872',medium:'Oil on canvas',dimensions:'48 × 63 cm',price:'€18,000',image:image('impression-sunrise-monet.jpg') },
  { id:'sample-2',artist:'Hilma af Klint',title:'The Swan, No. 10',year:'1915',medium:'Oil on canvas',dimensions:'150 × 150 cm',price:'€12,500',image:image('the-swan-no-10-af-klint.jpg') },
  { id:'sample-3',artist:'Piet Mondrian',title:'Composition No. IV',year:'1914',medium:'Oil on canvas',dimensions:'95 × 135 cm',price:'€24,000',image:image('composition-no-iv-mondrian.jpg') },
  { id:'sample-4',artist:'Édouard Manet',title:'Boating',year:'1874',medium:'Oil on canvas',dimensions:'97 × 130 cm',price:'€16,000',image:image('boating-manet.jpg') },
  { id:'sample-5',artist:'Henri Matisse',title:'The Dessert: Harmony in Red',year:'1908',medium:'Oil on canvas',dimensions:'180 × 220 cm',price:'€21,000',image:image('Matisse-The-Dessert-Harmony-in-Red-Henri-1908-fast.jpg') },
  { id:'sample-6',artist:'Hilma af Klint',title:'The Ten Largest, No. 7, Adulthood',year:'1907',medium:'Tempera on paper mounted on canvas',dimensions:'315 × 235 cm',price:'€19,500',image:image('Hilma_af_Klint_—_The_Ten_Largest_—_Number_7_Adulthood.jpg') },
];
