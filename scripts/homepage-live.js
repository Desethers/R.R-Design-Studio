(function () {
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var apiBase = local
    ? 'http://localhost:3001'
    : (window.GALLERY_API || 'https://gallery-os.vercel.app');
  var previewMode = false;

  function artistName(value) {
    if (!value) return '';
    if (value.name) return value.name;
    if (value.displayName) return value.displayName;
    return [value.firstName, value.lastName].filter(Boolean).join(' ');
  }

  function exhibitionArtists(exhibition) {
    return (exhibition && exhibition.artists || [])
      .map(artistName)
      .filter(Boolean)
      .join(', ');
  }

  function dateLabel(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value + 'T12:00:00'));
  }

  function range(exhibition) {
    return [dateLabel(exhibition && exhibition.startDate), dateLabel(exhibition && exhibition.endDate)]
      .filter(Boolean)
      .join(' — ');
  }

  function exhibitionUrl(exhibition) {
    return exhibition && exhibition.slug
      ? './exhibition.html?slug=' + encodeURIComponent(exhibition.slug)
      : './exhibitions.html';
  }

  function setText(root, selector, value) {
    var element = root && root.querySelector(selector);
    if (element) element.textContent = value || '';
  }

  function setImage(root, url, alt, width) {
    var image = root && root.querySelector('img');
    if (!image || !url) return;
    image.src = url + (url.indexOf('?') === -1 ? '?w=' + (width || 900) + '&auto=format' : '');
    image.alt = alt || '';
  }

  function updateHero(hero) {
    if (!hero) return;
    var root = document.querySelector('.banner-slide');
    if (!root) return;
    root.href = hero.ctaHref || '#';
    setImage(root, hero.imageUrl, hero.title, 1800);
    setText(root, '.banner-label', hero.subtitle);
    setText(root, '.banner-artist', hero.title);
    setText(root, '.banner-title', '');
    setText(root, '.banner-date', '');
    setText(root, '.banner-cta', hero.ctaLabel || '');
    root.setAttribute('aria-label', [hero.title, hero.subtitle].filter(Boolean).join(' — '));
  }

  function cardElement(item) {
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.className = 'card';
    link.href = item.href || '#';

    var figure = document.createElement('figure');
    figure.className = 'card-img';
    var image = document.createElement('img');
    image.loading = 'lazy';
    image.alt = item.imageAlt || item.title || '';
    if (item.imageUrl) {
      image.src = item.imageUrl + (item.imageUrl.indexOf('?') === -1 ? '?w=900&auto=format' : '');
    }
    figure.appendChild(image);

    var body = document.createElement('div');
    body.className = 'card-body';
    [
      ['card-location', item.location],
      ['card-artist', item.artist],
      ['card-title', item.title],
      ['card-date', item.date]
    ].forEach(function (entry) {
      if (!entry[1]) return;
      var element = document.createElement(entry[0] === 'card-title' ? 'h3' : 'p');
      element.className = entry[0];
      element.textContent = entry[1];
      body.appendChild(element);
    });

    if (item.linkLabel) {
      var more = document.createElement('span');
      more.className = 'card-link';
      more.textContent = item.linkLabel;
      body.appendChild(more);
    }

    link.appendChild(figure);
    link.appendChild(body);
    li.appendChild(link);
    return li;
  }

  function replaceCards(sectionSelector, items, keepWhenEmpty) {
    var grid = document.querySelector(sectionSelector + ' .cards-grid');
    if (!grid) return;
    grid.innerHTML = '';
    (items || []).forEach(function (item) {
      grid.appendChild(cardElement(item));
    });
    var section = document.querySelector(sectionSelector);
    if (section) section.hidden = !keepWhenEmpty && (!items || items.length === 0);
  }

  function exhibitionCard(exhibition) {
    return {
      href: exhibitionUrl(exhibition),
      imageUrl: exhibition && exhibition.mainImage && exhibition.mainImage.url,
      imageAlt: exhibition && exhibition.mainImage && exhibition.mainImage.alt,
      location: exhibition && exhibition.venue && exhibition.venue.city,
      artist: exhibitionArtists(exhibition),
      title: exhibition && exhibition.title,
      date: range(exhibition)
    };
  }

  function updateCurrentExhibition(exhibition) {
    replaceCards('#current-exhibition', exhibition ? [exhibitionCard(exhibition)] : []);
  }

  function updatePastExhibitions(exhibitions) {
    replaceCards('#exhibitions', (exhibitions || []).map(exhibitionCard));
  }

  function updateFeaturedArtworks(artworks) {
    replaceCards('#featured-artworks', (artworks || []).map(function (artwork) {
      return {
        href: artwork.artist && artwork.artist.slug
          ? './artist.html?slug=' + encodeURIComponent(artwork.artist.slug)
          : '#',
        imageUrl: artwork.mainImage && artwork.mainImage.url,
        imageAlt: artwork.title,
        artist: artistName(artwork.artist),
        title: artwork.title,
        date: artwork.year
      };
    }));
  }

  function updateFeaturedArtists(artists) {
    replaceCards('#featured-artists', (artists || []).map(function (artist) {
      return {
        href: artist.slug ? './artist.html?slug=' + encodeURIComponent(artist.slug) : './artists.html',
        imageUrl: artist.portrait && artist.portrait.url,
        imageAlt: artist.name,
        title: artist.name
      };
    }));
  }

  function updateNews(data) {
    var heading = document.querySelector('#focus .section-title');
    if (heading) heading.textContent = data.newsHeading || 'News';
    var limit = Math.max(1, Number(data.newsLimit) || 3);
    replaceCards('#focus', (data.news || []).slice(0, limit).map(function (item) {
      return {
        href: item.link || '#',
        imageUrl: item.imageUrl,
        imageAlt: item.title,
        location: item.category,
        artist: item.artist,
        title: item.title,
        date: item.date,
        linkLabel: 'Learn more →'
      };
    }), true);
  }

  function updateSeo(data) {
    if (data.seoTitle) document.title = data.seoTitle;
    var description = document.querySelector('meta[name="description"]');
    if (!description && data.seoDescription) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    if (description) description.content = data.seoDescription || '';
  }

  function render(data) {
    if (!data) return;
    updateHero(data.hero);
    updateCurrentExhibition(data.currentExhibition);
    updateFeaturedArtworks(data.featuredArtworks);
    updateFeaturedArtists(data.featuredArtists);
    updatePastExhibitions(data.exhibitions);
    updateNews(data);
    updateSeo(data);
  }

  function focusSection(section) {
    var selectors = {
      hero: '.highlights-carousel',
      'featured-artworks': '#featured-artworks',
      'current-exhibition': '#current-exhibition',
      'featured-artists': '#featured-artists',
      news: '#focus',
      seo: '.highlights-carousel'
    };
    var target = document.querySelector(selectors[section] || '.highlights-carousel');
    if (!target) return;
    target.style.scrollMarginTop = '84px';
    requestAnimationFrame(function () {
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }

  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'gallery-os:homepage-preview') return;
    previewMode = true;
    render(event.data.data);
    focusSection(event.data.section);
  });

  fetch(apiBase + '/api/public/homepage', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('Homepage API unavailable');
      return response.json();
    })
    .then(function (data) {
      if (!previewMode) render(data);
    })
    .catch(function () {
      // Keep the static fallback when the dashboard API is unavailable.
    });
})();
