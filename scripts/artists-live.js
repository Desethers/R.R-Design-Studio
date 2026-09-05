/**
 * Artists Live — API-driven rendering
 * ─────────────────────────────────────────────────────────────────────────
 * Remplace le grid statique par les données Gallery-OS/Sanity.
 * L'API est la source de vérité pour le roster des artistes.
 *
 *   • API disponible → les cartes correspondantes sont actualisées depuis Sanity
 *   • API indisponible → fallback silencieux, le HTML statique reste affiché
 *
 * Inclure dans artists.html :
 *   <script>window.GALLERY_API = 'https://ton-dashboard.vercel.app';</script>
 *   <script src="scripts/artists-live.js" defer></script>
 */
(function () {
  'use strict'

  const API_BASE = (window.GALLERY_API || 'http://localhost:3000').replace(/\/$/, '')
  const API_URL  = API_BASE + '/api/public/artists'

  /**
   * Chaque artiste possède une page dynamique générique : artist.html?slug=…
   * artist-page-live.js hydrate la page depuis Gallery OS — plus aucun mapping
   * manuel à maintenir.
   */
  function artistHref(artist) {
    return artist.slug ? 'artist.html?slug=' + encodeURIComponent(artist.slug) : '#'
  }

  // ── Utilitaires ─────────────────────────────────────────────────────────

  function escHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function artistName(a) {
    return a.displayName || ((a.firstName || '') + ' ' + (a.lastName || '')).trim()
  }

  function imgUrl(artist, w) {
    if (!artist.portrait || !artist.portrait.url) return ''
    const url = artist.portrait.url
    const sep = url.indexOf('?') === -1 ? '?' : '&'
    return url + sep + 'w=' + (w || 800) + '&h=' + (w || 800) + '&fit=crop&auto=format'
  }

  function cardHTML(artist) {
    const name  = escHtml(artistName(artist))
    const img   = imgUrl(artist, 800)
    const href  = artistHref(artist)
    const cls   = 'artist-card'

    return (
      '<a href="' + href + '" class="' + cls + '" role="listitem"' +
          (artist.slug ? ' data-artist-slug="' + escHtml(artist.slug) + '"' : '') + '>' +
        '<figure class="artist-card-img">' +
          (img
            ? '<img src="' + img + '" alt="' + name + '" width="800" height="800" loading="lazy" decoding="async" />'
            : '<div style="width:100%;aspect-ratio:1/1;background:#f4f4f5"></div>') +
        '</figure>' +
        '<h2>' + name + '</h2>' +
      '</a>'
    )
  }

  // ── Fetch & render ───────────────────────────────────────────────────────

  async function load() {
    let data
    try {
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      data = await res.json()
    } catch (err) {
      console.warn('[artists-live] API indisponible, grille statique conservée :', err.message)
      return
    }

    if (!Array.isArray(data) || data.length === 0) return

    const grid = document.querySelector('.artists-grid')
    if (!grid) return

    // Keep the authored roster visible when the API only contains a partial list.
    const existingCards = new Map()
    grid.querySelectorAll('.artist-card').forEach(function (card) {
      const name = card.querySelector('h2')?.textContent?.trim()
      if (name) existingCards.set(name.toLowerCase(), card)
    })

    data.forEach(function (artist) {
      const name = artistName(artist)
      const card = existingCards.get(name.toLowerCase())

      if (!card) {
        grid.insertAdjacentHTML('beforeend', cardHTML(artist))
        return
      }

      card.href = artistHref(artist)
      if (artist.slug) card.dataset.artistSlug = artist.slug

      const heading = card.querySelector('h2')
      if (heading) heading.textContent = name

      const img = card.querySelector('img')
      const src = imgUrl(artist, 800)
      if (img && src) {
        img.src = src
        img.alt = name
      }
    })

    document.dispatchEvent(new CustomEvent('artists:loaded', { detail: data }))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load)
  } else {
    load()
  }
})()
