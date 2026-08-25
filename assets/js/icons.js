(function () {
  'use strict';

  var S = 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M3 10.7 12 3l9 7.7"/><path '+S+' d="M5.2 9.8V21h13.6V9.8M9.2 21v-6.2h5.6V21"/></svg>',
    layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="m12 3 9 5-9 5-9-5 9-5Z"/><path '+S+' d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle '+S+' cx="9" cy="8" r="3"/><path '+S+' d="M3.5 20c.4-3.3 2.2-5 5.5-5s5.1 1.7 5.5 5M16 11a3 3 0 1 0 0-6M15.5 15c3.1.1 4.7 1.7 5 5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect '+S+' x="3.5" y="5" width="17" height="15.5" rx="2"/><path '+S+' d="M7 3v4M17 3v4M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01"/></svg>',
    chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M4 19V5M4 19h17"/><path '+S+' d="m7 15 3-4 3 2 5-7"/><path '+S+' d="M15 6h3v3"/></svg>',
    gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect '+S+' x="3" y="9" width="18" height="11" rx="1.5"/><path '+S+' d="M12 9v11M2.5 9h19M4 5.8c0-1.5 1.1-2.5 2.5-2.5 2.4 0 5.5 5.7 5.5 5.7S7.8 9 6.2 9C4.8 9 4 7.8 4 6.4c0-.2 0-.4 0-.6ZM20 5.8c0-1.5-1.1-2.5-2.5-2.5-2.4 0-5.5 5.7-5.5 5.7s4.2 0 5.8 0c1.4 0 2.2-1.2 2.2-2.6 0-.2 0-.4 0-.6Z"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M8 6h12M8 12h12M8 18h12"/><path '+S+' d="M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect '+S+' x="3" y="5" width="18" height="14" rx="2"/><path '+S+' d="m4 7 8 6 8-6"/></svg>',
    card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect '+S+' x="3" y="5" width="18" height="14" rx="2"/><path '+S+' d="M3 10h18M7 15h3"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle '+S+' cx="12" cy="8" r="3.2"/><path '+S+' d="M5 21c.6-4 2.9-6 7-6s6.4 2 7 6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect '+S+' x="4" y="10" width="16" height="11" rx="2"/><path '+S+' d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7ZM10 21h4"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M6.5 3.5 9 3l2 5-2.2 1.5a15 15 0 0 0 5.2 5.2l1.5-2.2 5 2-.5 2.5c-.3 1.4-1.6 2.3-3 2A15.5 15.5 0 0 1 4.5 6.5c-.3-1.4.6-2.7 2-3Z"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle '+S+' cx="12" cy="12" r="9"/><path '+S+' d="M12 10v6M12 7h.01"/></svg>',
    support: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M4 18v-6a8 8 0 0 1 16 0v6"/><path '+S+' d="M4 16H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3v-4M20 16h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3v-4M12 20h3"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M4 6h15a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h15"/><path '+S+' d="M16 12h5M16 12a2 2 0 1 0 0 4h5"/></svg>',
    arrowDown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M12 4v14M6.5 12.5 12 18l5.5-5.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path '+S+' d="m8 12 2.5 2.5L16 9"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path '+S+' d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></svg>',
    mark: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M32 4c15 0 27 8 27 18 0 6-4 10-10 13 2-8-2-16-10-20-5-3-11-4-17-2 3-5 6-7 10-9Z"/><path fill="currentColor" opacity=".65" d="M12 30c4-6 10-9 17-9 10 0 18 7 18 17 0 9-7 17-16 20-10-4-17-11-19-20 7 4 14 5 21 2-3-7-9-10-21-10Z"/></svg>'
  };

  function lowerText(el) { return (el.textContent || '').toLowerCase(); }
  function hrefText(el) { var p = el.closest('a,button'); return ((p && (p.getAttribute('href') || p.getAttribute('onclick'))) || '').toLowerCase(); }
  function resolve(el) {
    if (el.dataset.icon && icons[el.dataset.icon]) return el.dataset.icon;
    var host = (lowerText(el.parentElement) + ' ' + hrefText(el)).trim();
    if (el.classList.contains('quick-item-icon')) {
      if (host.indexOf('product') >= 0 || host.indexOf('plan') >= 0) return 'layers';
      if (host.indexOf('team') >= 0 || host.indexOf('household') >= 0) return 'users';
      if (host.indexOf('check') >= 0) return 'calendar';
      if (host.indexOf('salary') >= 0 || host.indexOf('credit') >= 0) return 'chart';
      if (host.indexOf('gift') >= 0 || host.indexOf('offer') >= 0) return 'gift';
      if (host.indexOf('message') >= 0) return 'mail';
      if (host.indexOf('bank') >= 0 || host.indexOf('payment method') >= 0) return 'card';
      return 'list';
    }
    if (el.classList.contains('nav-icon')) {
      if (host.indexOf('product') >= 0 || host.indexOf('plan') >= 0) return 'layers';
      if (host.indexOf('team') >= 0 || host.indexOf('household') >= 0) return 'users';
      if (host.indexOf('profile') >= 0) return 'user';
      return 'home';
    }
    if (el.classList.contains('menu-icon')) {
      if (/payment method|bank|card/.test(host)) return 'card';
      if (/make a payment activity|activity|records/.test(host)) return 'list';
      if (/refund/.test(host)) return 'arrowDown';
      if (/daily|check/.test(host)) return 'calendar';
      if (/salary|credit|income/.test(host)) return 'chart';
      if (/offer|gift/.test(host)) return 'gift';
      if (/password|secure/.test(host)) return 'lock';
      if (/alert|notification/.test(host)) return 'bell';
      if (/message|email/.test(host)) return 'mail';
      if (/contact|phone|support/.test(host)) return 'support';
      return 'info';
    }
    if (el.classList.contains('gift-icon')) return 'gift';
    if (el.classList.contains('checkin-icon')) return 'calendar';
    if (el.classList.contains('empty-icon')) return 'list';
    if (el.classList.contains('avatar')) return 'user';
    if (el.classList.contains('vt-icon')) return 'chart';
    if (el.classList.contains('info-icon')) return 'info';
    if (el.classList.contains('saved-card-icon')) return 'card';
    if (el.classList.contains('lock-icon')) return 'lock';
    if (el.classList.contains('ci-icon')) return 'support';
    if (el.classList.contains('notif-icon')) return 'bell';
    return null;
  }

  function render() {
    document.querySelectorAll('.quick-item-icon,.nav-icon,.menu-icon,.gift-icon,.checkin-icon,.empty-icon,.avatar,.vt-icon,.info-icon,.saved-card-icon,.lock-icon,.ci-icon,.notif-icon,.welcome-mark').forEach(function (el) {
      var name = el.classList.contains('welcome-mark') ? 'mark' : resolve(el);
      if (!name || !icons[name]) return;
      el.classList.add('g-icon');
      el.innerHTML = icons[name];
      el.setAttribute('aria-hidden', 'true');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
  window.SerlzoIcons = { render: render, icons: icons };
})();
