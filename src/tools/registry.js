export const toolDefinitions = [
  { id: 'artwork-pdf', name: 'Artwork PDF Generator', icon: '▤', description: 'Curate a selection. Make a considered document.', ready: true },
  { id: 'searchable-inventory', name: 'Searchable Inventory', icon: '⌕', description: 'Live Gallery OS inventory with filters, documents and related conversations.', linked: true, preview: '/tools/searchable-inventory/' },
  { id: 'gallery-archive-ai', name: 'Gallery Archive AI', icon: '▱', description: 'Gallery OS records and Conversations, with source-backed AI answers.', linked: true, preview: '/tools/gallery-archive-ai/' },
  { id: 'morning-briefing', name: 'Morning Briefing', icon: '☼', description: 'Gallery OS assistant, linked locally. Automated briefings are not connected yet.', linked: true, preview: '/tools/morning-briefing/' },
  { id: 'inquiry-tracker', name: 'Inquiry Tracker', icon: '↗', description: 'Artwork inquiries and collector messages awaiting a reply.' },
];
export const toolEntries = toolDefinitions.map((tool, i) => ({
  id: `tool-${tool.id}`, code: `U0${i + 1}`, family: 'tools', name: tool.name,
  category: tool.id, type: 'tool', interaction: tool.ready || tool.linked ? 'click' : 'planned',
  tags: ['tools', tool.linked ? 'local alias' : tool.ready ? 'functional' : 'in development'], updated: '2026-11', layout: 'full',
  render: () => `<section class="section-embed section-embed--tall"><iframe src="${tool.preview || (tool.ready ? '/tools/artwork-pdf/' : `/tools/placeholder/?tool=${tool.id}`)}" title="${tool.name}${tool.ready || tool.linked ? '' : ' — In development'}" loading="eager"></iframe></section>`,
}));
