// inhabit. agent shell — injects the top nav based on data-page
(function () {
  const slot = document.querySelector('[data-topnav]');
  if (!slot) return;
  const page = slot.dataset.page || '';

  const ICONS = {
    home:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 9v11a1 1 0 001 1h4v-7h4v7h4a1 1 0 001-1V9"/></svg>',
    inbox:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4zM4 4l8 8 8-8"/></svg>',
    tasks:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
    pipeline: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="5" height="16"/><rect x="10" y="4" width="5" height="10"/><rect x="17" y="4" width="4" height="13"/></svg>',
    contacts: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21v-7a2 2 0 012-2h10a2 2 0 012 2v7M9 7a3 3 0 116 0 3 3 0 01-6 0z"/></svg>',
    search:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>',
    listings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V7a2 2 0 00-2-2H6a2 2 0 00-2 2v5l8 9 8-9zM12 11h.01"/></svg>'
  };

  const links = [
    { id: 'home',     label: 'Home',        href: 'agent-home.html' },
    { id: 'inbox',    label: 'Inbox',       href: 'agent-inbox.html',       badge: '12' },
    { id: 'tasks',    label: 'Tasks',       href: 'agent-tasks.html',       badge: '9' },
    { id: 'pipeline', label: 'Pipeline',    href: '#' },
    { id: 'contacts', label: 'Contacts',    href: 'agent-contacts.html' },
    { id: 'search',   label: 'Search',      href: 'agent-search.html' },
    { id: 'listings', label: 'My Listings', href: 'agent-my-listings.html' }
  ];

  const linkHtml = links.map(l =>
    '<a href="' + l.href + '"' + (l.id === page ? ' class="active"' : '') + '>' +
      ICONS[l.id] + l.label +
      (l.badge ? ' <span class="badge">' + l.badge + '</span>' : '') +
    '</a>'
  ).join('');

  slot.outerHTML =
    '<header class="topnav">' +
      '<a class="topnav-brand" href="agent-home.html">inhabit<span>.</span> <small>app</small></a>' +
      '<nav class="topnav-links">' + linkHtml + '</nav>' +
      '<div class="topnav-right">' +
        '<button class="topnav-search">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>' +
          '<span>Search contacts, listings…</span>' +
          '<kbd>⌘K</kbd>' +
        '</button>' +
        '<button class="topnav-icon-btn" title="Notifications">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0"/></svg>' +
          '<span class="pulse"></span>' +
        '</button>' +
        '<div class="topnav-profile">' +
          '<div class="topnav-avatar">JM</div>' +
          '<div class="topnav-profile-meta">' +
            '<div class="topnav-profile-name">James Meyer</div>' +
            '<div class="topnav-profile-role">Broker</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</header>';
})();
